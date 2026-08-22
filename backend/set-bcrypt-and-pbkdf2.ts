import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding universally compatible bcrypt hashes into Neon DB...');

  const password = 'admin@2026';
  // Use bcrypt with 10 rounds (compatible with both legacy Render backend and new backend)
  const bcryptHash = bcrypt.hashSync(password, 10);

  const accounts = [
    { username: 'admin@graduation.edu', name: 'Graduation Admin' },
    { username: 'admin', name: 'Admin' },
    { username: 'admin@test.com', name: 'Test Admin' },
  ];

  for (const acc of accounts) {
    const user = await prisma.user.upsert({
      where: { username: acc.username.toLowerCase() },
      update: {
        passwordHash: bcryptHash,
        name: acc.name,
        role: 'ADMIN',
      },
      create: {
        username: acc.username.toLowerCase(),
        passwordHash: bcryptHash,
        name: acc.name,
        role: 'ADMIN',
      },
    });

    console.log(`✓ Seeded universal bcrypt account: ${user.username} | Verified: ${bcrypt.compareSync(password, user.passwordHash)}`);
  }

  console.log('Finished updating admin credentials in Neon DB.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
