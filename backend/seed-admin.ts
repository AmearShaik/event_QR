import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from './src/utils/password';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const accounts = [
    { username: 'admin@graduation.edu', password: 'admin@2026', name: 'Graduation Admin', role: 'ADMIN' },
    { username: 'admin', password: 'admin@2026', name: 'Admin', role: 'ADMIN' },
    { username: 'admin@test.com', password: 'admin@2026', name: 'Test Admin', role: 'ADMIN' },
  ];

  console.log('Connecting to database...');
  console.log('===================================================');
  console.log(' SEEDING ADMIN ACCOUNTS INTO DATABASE');
  console.log('===================================================');

  for (const acc of accounts) {
    const passwordHash = PasswordUtils.hashPassword(acc.password);
    const user = await prisma.user.upsert({
      where: { username: acc.username.toLowerCase() },
      update: {
        passwordHash,
        name: acc.name,
        role: acc.role,
      },
      create: {
        username: acc.username.toLowerCase(),
        passwordHash,
        name: acc.name,
        role: acc.role,
      },
    });

    const isMatch = PasswordUtils.verifyPassword(acc.password, user.passwordHash);
    console.log(`✓ Seeded User: "${user.username}" | Password: "${acc.password}" | Verified: ${isMatch} | ID: ${user.id}`);
  }

  console.log('===================================================');
  console.log(' [SUCCESS] All admin credentials seeded successfully!');
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
