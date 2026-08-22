import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB count:', users.length);
  for (const u of users) {
    console.log({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      passwordHash: u.passwordHash,
      hashLength: u.passwordHash?.length,
      isColonSeparated: u.passwordHash?.includes(':'),
      isBcrypt: u.passwordHash?.startsWith('$2'),
    });
  }
}

main().finally(() => prisma.$disconnect());
