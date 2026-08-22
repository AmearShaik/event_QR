import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('--- ALL USERS IN DB ---');
  for (const u of users) {
    console.log({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt
    });
  }
}

main().finally(() => prisma.$disconnect());
