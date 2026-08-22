import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function testStats(college: string) {
  const collegeConditions: any[] = [];
  if (college && college !== 'all') {
    if (college === 'mvsr') {
      collegeConditions.push({
        OR: [
          { college: { contains: 'MVSR', mode: 'insensitive' } },
          { studentId: { startsWith: '2451' } },
        ],
      });
    } else if (college === 'matrusri') {
      collegeConditions.push({
        OR: [
          { college: { contains: 'Matrusri', mode: 'insensitive' } },
          { studentId: { startsWith: '1608' } },
        ],
      });
    }
  }

  const baseWhere = collegeConditions.length > 0 ? { AND: collegeConditions } : {};

  const paidCondition = {
    AND: [
      ...collegeConditions,
      {
        OR: [
          { normalizedPaymentStatus: 'PAID' },
          { paymentStatus: { contains: 'Paid', mode: 'insensitive' } },
        ],
      },
      {
        NOT: [
          { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
          { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
        ],
      },
    ],
  };

  const unpaidCondition = {
    AND: [
      ...collegeConditions,
      {
        OR: [
          { normalizedPaymentStatus: { in: ['NOT_PAID', 'PARTIALLY_PAID'] } },
          { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
          { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
        ],
      },
    ],
  };

  const [total, paid, unpaid] = await Promise.all([
    prisma.candidate.count({ where: baseWhere }),
    prisma.candidate.count({ where: paidCondition }),
    prisma.candidate.count({ where: unpaidCondition }),
  ]);

  console.log(`[College: ${college.toUpperCase()}] Total: ${total} | Paid: ${paid} | Unpaid: ${unpaid}`);
}

async function main() {
  console.log('\n--- TESTING DASHBOARD COLLEGE STATS ---\n');
  await testStats('all');
  await testStats('mvsr');
  await testStats('matrusri');
  console.log('\n---------------------------------------\n');
}

main().finally(() => prisma.$disconnect());
