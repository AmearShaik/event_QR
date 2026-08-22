import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function test(college: string) {
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
  const paidCondition = { AND: [...collegeConditions, { normalizedPaymentStatus: 'PAID' }] };
  const unpaidCondition = { AND: [...collegeConditions, { normalizedPaymentStatus: { in: ['NOT_PAID', 'PARTIALLY_PAID'] } }] };

  const [total, paid, unpaid] = await Promise.all([
    prisma.candidate.count({ where: baseWhere }),
    prisma.candidate.count({ where: paidCondition }),
    prisma.candidate.count({ where: unpaidCondition }),
  ]);

  console.log(`[${college.toUpperCase().padEnd(8)}] Total: ${total} | Paid: ${paid} | Unpaid: ${unpaid} | Sum (Paid+Unpaid): ${paid + unpaid}`);
}

async function main() {
  console.log('\n--- VERIFYING EXACT DASHBOARD COUNTS ---\n');
  await test('all');
  await test('mvsr');
  await test('matrusri');
  console.log('\n----------------------------------------\n');
}

main().finally(() => prisma.$disconnect());
