import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from './src/utils/password';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.findMany();
  console.log('Total users in DB:', users.length);
  for (const u of users) {
    const isMatch = PasswordUtils.verifyPassword('admin@2026', u.passwordHash);
    console.log(`User: ${u.username}, Role: ${u.role}, Password 'admin@2026' matches: ${isMatch}`);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
