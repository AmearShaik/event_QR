import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from './src/utils/password';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedWithRetry(retries = 5) {
  console.log('Connecting to Neon PostgreSQL database...');
  
  const accounts = [
    { username: 'admin@graduation.edu', password: 'admin@2026', name: 'Graduation Admin', role: 'ADMIN' },
    { username: 'admin', password: 'admin@2026', name: 'Admin', role: 'ADMIN' },
    { username: 'admin@test.com', password: 'admin@2026', name: 'Test Admin', role: 'ADMIN' },
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${retries}] Seeding admin accounts...`);
      
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

        const isValid = PasswordUtils.verifyPassword(acc.password, user.passwordHash);
        console.log(`✓ [SUCCESS] Seeded: "${user.username}" | Role: ${user.role} | Password Verified: ${isValid} | ID: ${user.id}`);
      }

      console.log('\n--- ALL ADMIN ACCOUNTS SEEDED & READY IN DATABASE ---\n');
      return;
    } catch (err: any) {
      console.warn(`Attempt ${attempt} failed (${err.message}). Retrying in 3 seconds...`);
      if (attempt === retries) {
        throw err;
      }
      await sleep(3000);
    }
  }
}

seedWithRetry()
  .catch((err) => {
    console.error('Final failure seeding admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
