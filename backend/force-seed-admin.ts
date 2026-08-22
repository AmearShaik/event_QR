import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from './src/utils/password';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  
  const accounts = [
    { username: 'admin@graduation.edu', password: 'admin@2026', name: 'Graduation Admin', role: 'ADMIN' },
    { username: 'admin', password: 'admin@2026', name: 'Admin', role: 'ADMIN' },
    { username: 'admin@test.com', password: 'admin@2026', name: 'Test Admin', role: 'ADMIN' },
  ];

  console.log('\n--- SEEDING ADMIN ACCOUNTS INTO DATABASE ---');
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

    // Verify immediate match
    const isValid = PasswordUtils.verifyPassword(acc.password, user.passwordHash);
    console.log(`✓ Seeded User: "${user.username}" | Password: "${acc.password}" | Match Verified: ${isValid} | ID: ${user.id}`);
  }
  console.log('---------------------------------------------\n');
}

main()
  .catch((err) => {
    console.error('Error seeding admin accounts:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
