import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: 'admin@graduation.edu' },
  });

  console.log('User in Neon DB:', user?.username);
  console.log('Current Hash in Neon DB:', user?.passwordHash);

  // Generate fresh PBKDF2 hash
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync('admin@2026', salt, 10000, 64, 'sha512').toString('hex');
  const newPasswordHash = `${salt}:${hash}`;

  // Update directly in Neon DB so old Render code can verify immediately!
  await prisma.user.update({
    where: { id: user!.id },
    data: { passwordHash: newPasswordHash },
  });

  console.log('Updated Neon DB passwordHash to fresh PBKDF2 hash:', newPasswordHash);

  // Verify test
  const [s, h] = newPasswordHash.split(':');
  const check = crypto.pbkdf2Sync('admin@2026', s, 10000, 64, 'sha512').toString('hex');
  console.log('Verification check result:', check === h);
}

main().finally(() => prisma.$disconnect());
