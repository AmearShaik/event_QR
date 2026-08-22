import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from './src/utils/password';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const username = 'admin@graduation.edu';
  const password = 'admin@2026';
  const name = 'Graduation Admin';
  const role = 'ADMIN';

  console.log('Connecting to Neon PostgreSQL database...');
  console.log('===================================================');
  console.log(' SEEDING SINGLE ADMIN ACCOUNT INTO DATABASE');
  console.log('===================================================');

  // Clean up any extra admin users
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
  console.log(`✓ Admin Username: "${user.username}"`);
  console.log(`✓ Admin Password: "${password}"`);
  console.log(`✓ Password Verified: ${isMatch}`);
  console.log(`✓ User ID: ${user.id}`);
  console.log('===================================================');
  console.log(' [SUCCESS] Single admin credential seeded cleanly!');
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
