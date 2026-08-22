import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.candidate.count();
  const byCollege = await prisma.candidate.groupBy({
    by: ['college'],
    _count: { id: true },
  });

  const startsWith1608 = await prisma.candidate.count({
    where: { studentId: { startsWith: '1608' } },
  });

  const startsWith2451 = await prisma.candidate.count({
    where: { studentId: { startsWith: '2451' } },
  });

  console.log({
    total: all,
    byCollege,
    startsWith1608,
    startsWith2451,
  });
}

main().finally(() => prisma.$disconnect());
