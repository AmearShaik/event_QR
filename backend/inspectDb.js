const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.candidate.count();
  console.log('Total candidates in DB:', total);

  const sample732 = await prisma.candidate.findMany({
    where: { studentId: { contains: '732' } },
    take: 10,
    select: { studentId: true, name: true, program: true },
  });

  console.log('Sample 732 candidates:', sample732);

  const testCandidates = await prisma.candidate.findMany({
    where: { studentId: { in: ['GD001', 'GD002', 'GD003', 'GD004'] } },
    select: { studentId: true, name: true },
  });
  console.log('Test candidates GD001-4:', testCandidates);

  const first10 = await prisma.candidate.findMany({
    take: 10,
    select: { studentId: true, name: true },
  });
  console.log('First 10 candidates in DB:', first10);
}

main().finally(async () => {
  await prisma.$disconnect();
});
