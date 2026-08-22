import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing college column values in database...');

  const updateMatrusri = await prisma.candidate.updateMany({
    where: { studentId: { startsWith: '1608' } },
    data: { college: 'Matrusri Engineering College' },
  });

  const updateMvsr = await prisma.candidate.updateMany({
    where: { studentId: { startsWith: '2451' } },
    data: { college: 'MVSR Engineering College' },
  });

  console.log(`✓ Updated ${updateMatrusri.count} candidates to Matrusri Engineering College`);
  console.log(`✓ Updated ${updateMvsr.count} candidates to MVSR Engineering College`);

  const breakdown = await prisma.candidate.groupBy({
    by: ['college'],
    _count: { id: true },
  });
  console.log('Current Breakdown:', breakdown);
}

main().finally(() => prisma.$disconnect());
