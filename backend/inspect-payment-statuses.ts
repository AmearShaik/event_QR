import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.candidate.count();
  const rawStatuses = await prisma.candidate.groupBy({
    by: ['paymentStatus'],
    _count: { id: true },
  });
  const normalizedStatuses = await prisma.candidate.groupBy({
    by: ['normalizedPaymentStatus'],
    _count: { id: true },
  });

  console.log('Total Candidates:', total);
  console.log('Raw Payment Statuses:', rawStatuses);
  console.log('Normalized Payment Statuses:', normalizedStatuses);

  // Check overlap
  const bothPaidAndNotPaid = await prisma.candidate.findMany({
    where: {
      AND: [
        {
          OR: [
            { normalizedPaymentStatus: 'PAID' },
            { paymentStatus: { contains: 'Paid', mode: 'insensitive' } },
          ],
        },
        {
          OR: [
            { normalizedPaymentStatus: { in: ['NOT_PAID', 'PARTIALLY_PAID'] } },
            { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
            { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: {
      studentId: true,
      name: true,
      college: true,
      paymentStatus: true,
      normalizedPaymentStatus: true,
    },
  });

  console.log('Overlap Candidates count:', bothPaidAndNotPaid.length);
  if (bothPaidAndNotPaid.length > 0) {
    console.log('Overlap Samples:', bothPaidAndNotPaid.slice(0, 5));
  }
}

main().finally(() => prisma.$disconnect());
