import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from './src/utils/password';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function seedWithRetry(retries = 5, delay = 2000) {
  const username = 'admin@graduation.edu';
  const password = 'admin@2026';
  const name = 'Graduation Admin';
  const role = 'ADMIN';

  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`[Attempt ${i}/${retries}] Seeding single admin: ${username}...`);
      
      // Remove any extra users
      await prisma.user.deleteMany({
        where: {
          username: { not: username },
        },
      });

      const passwordHash = PasswordUtils.hashPassword(password);
      const user = await prisma.user.upsert({
        where: { username },
        update: {
          passwordHash,
          name,
          role,
        },
        create: {
          username,
          passwordHash,
          name,
          role,
        },
      });

      const isMatch = PasswordUtils.verifyPassword(password, user.passwordHash);
      console.log(`✓ [SUCCESS] Seeded: "${user.username}" | Role: ${user.role} | Password Verified: ${isMatch} | ID: ${user.id}`);
      return;
    } catch (err: any) {
      console.error(`[Attempt ${i} Failed]:`, err.message);
      if (i < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  console.log('Connecting to Neon PostgreSQL database...');
  await seedWithRetry();
  console.log('\n--- SINGLE ADMIN ACCOUNT SEEDED & READY IN DATABASE ---\n');
}

main()
  .catch((err) => {
    console.error('Fatal error seeding admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
