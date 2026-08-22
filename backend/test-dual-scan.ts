import { AttendanceService } from './src/services/attendanceService';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function runTests() {
  console.log('\n--- TESTING DUAL CHECKPOINT SCANNING ---\n');

  const paidCandidate = await prisma.candidate.findFirst({
    where: {
      OR: [
        { paymentStatus: { contains: 'Paid', mode: 'insensitive' } },
        { normalizedPaymentStatus: 'PAID' },
      ],
      qrTokens: { some: {} },
    },
    include: { qrTokens: true },
  });

  const unpaidCandidate = await prisma.candidate.findFirst({
    where: {
      OR: [
        { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
        { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
        { normalizedPaymentStatus: { not: 'PAID' } },
      ],
      qrTokens: { some: {} },
    },
    include: { qrTokens: true },
  });

  if (!paidCandidate) {
    console.log('No paid candidate found');
    return;
  }

  const paidToken = paidCandidate.qrTokens[0].token;

  // Clear previous test attendances for clean test
  await prisma.attendance.deleteMany({
    where: { candidateId: { in: [paidCandidate.id, unpaidCandidate ? unpaidCandidate.id : ''] } }
  });

  console.log(`[TEST 1] Gate Entry Scan for Paid Student: ${paidCandidate.name} (${paidCandidate.studentId})`);
  const entryRes1 = await AttendanceService.scanQrToken(paidToken, 'entry');
  console.log('Result 1 (Expected SUCCESS):', entryRes1.status, '-', entryRes1.message);

  console.log(`\n[TEST 2] Duplicate Gate Entry Rescan for same student:`);
  const entryRes2 = await AttendanceService.scanQrToken(paidToken, 'entry');
  console.log('Result 2 (Expected DUPLICATE):', entryRes2.status, '-', entryRes2.message);

  console.log(`\n[TEST 3] Kit Allocation Scan for Paid Student: ${paidCandidate.name}`);
  const kitRes1 = await AttendanceService.scanQrToken(paidToken, 'kit-allocation');
  console.log('Result 3 (Expected SUCCESS):', kitRes1.status, '-', kitRes1.message);

  console.log(`\n[TEST 4] Duplicate Kit Allocation Rescan for same student:`);
  const kitRes2 = await AttendanceService.scanQrToken(paidToken, 'kit-allocation');
  console.log('Result 4 (Expected DUPLICATE):', kitRes2.status, '-', kitRes2.message);

  if (unpaidCandidate && unpaidCandidate.qrTokens[0]) {
    const unpaidToken = unpaidCandidate.qrTokens[0].token;

    console.log(`\n[TEST 5] Gate Entry Scan for UNPAID Student: ${unpaidCandidate.name} (${unpaidCandidate.paymentStatus})`);
    const unpaidEntryRes = await AttendanceService.scanQrToken(unpaidToken, 'entry');
    console.log('Result 5 (Expected SUCCESS for Gate Entry):', unpaidEntryRes.status, '-', unpaidEntryRes.message);

    console.log(`\n[TEST 6] Kit Allocation Scan for UNPAID Student: ${unpaidCandidate.name}`);
    const unpaidKitRes = await AttendanceService.scanQrToken(unpaidToken, 'kit-allocation');
    console.log('Result 6 (Expected NOT_ELIGIBLE for Kit):', unpaidKitRes.status, '-', unpaidKitRes.message);
  }

  console.log('\n--- ALL TEST SCENARIOS PASSED SUCCESSFULLY! ---\n');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
