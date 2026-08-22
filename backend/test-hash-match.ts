import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: 'admin@graduation.edu' },
  });

  console.log('User found in Neon DB:', user?.username);
  if (!user) return;

  const [salt, originalHash] = user.passwordHash.split(':');
  console.log('Salt from DB:', salt);
  console.log('OriginalHash from DB:', originalHash);

  const hashTest = crypto.pbkdf2Sync('admin@2026', salt, 10000, 64, 'sha512').toString('hex');
  console.log('Calculated Hash with "admin@2026":', hashTest);
  console.log('Matches originalHash?:', hashTest === originalHash);
}

main().finally(() => prisma.$disconnect());
