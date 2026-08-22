import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from './src/utils/password';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.DEFAULT_ADMIN_USERNAME || 'admin@graduation.edu').trim().toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin@2026';
  const name = process.env.DEFAULT_ADMIN_NAME || 'Graduation Admin';

  console.log(`[Seed Admin] Connecting to database: ${process.env.DATABASE_URL?.split('@')[1] || 'Neon'}`);

  const passwordHash = PasswordUtils.hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      name,
      role: 'ADMIN',
    },
    create: {
      username,
      passwordHash,
      name,
      role: 'ADMIN',
    },
  });

  console.log('===================================================');
  console.log(' [SUCCESS] Admin Account Seeded into Neon Database:');
  console.log(` Username: ${admin.username}`);
  console.log(` Password: ${password}`);
  console.log(` Name:     ${admin.name}`);
  console.log(` Role:     ${admin.role}`);
  console.log(` ID:       ${admin.id}`);
  console.log('===================================================');
}

main()
  .catch((err) => {
    console.error('[Seed Admin] Error seeding admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
