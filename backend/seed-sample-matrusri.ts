import { PrismaClient } from '@prisma/client';
import { detectCollege } from './src/utils/collegeUtils';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const sampleMatrusriStudents = [
  { studentId: '1608-22-732-002', name: 'KOPPU CHANDRA HASA', program: 'CIVIL', paymentStatus: 'Paid', normalizedPaymentStatus: 'PAID' },
  { studentId: '1608-22-732-003', name: 'NAMPALLY RADHIKA', program: 'CIVIL', paymentStatus: 'Paid', normalizedPaymentStatus: 'PAID' },
  { studentId: '1608-22-732-008', name: 'VADTHYAVAYH UJWAL NAIK', program: 'CIVIL', paymentStatus: 'Paid', normalizedPaymentStatus: 'PAID' },
  { studentId: '1608-22-733-001', name: 'ABHINAV MUDDUSETTY', program: 'CSE - A', paymentStatus: 'Paid', normalizedPaymentStatus: 'PAID' },
  { studentId: '1608-22-733-002', name: 'N RISHI REDDY', program: 'CSE - A', paymentStatus: 'Paid', normalizedPaymentStatus: 'PAID' },
  { studentId: '1608-22-733-003', name: 'PESARI DIVYA', program: 'CSE - A', paymentStatus: 'Paid', normalizedPaymentStatus: 'PAID' },
];

async function seed() {
  console.log('\n--- SEEDING SAMPLE MATRUSRI STUDENTS ---\n');

  for (const s of sampleMatrusriStudents) {
    const college = detectCollege(s.studentId);
    const candidate = await prisma.candidate.upsert({
      where: { studentId: s.studentId },
      update: {
        name: s.name,
        program: s.program,
        college,
        paymentStatus: s.paymentStatus,
        normalizedPaymentStatus: s.normalizedPaymentStatus,
        eligibilityStatus: true,
      },
      create: {
        studentId: s.studentId,
        name: s.name,
        program: s.program,
        college,
        paymentStatus: s.paymentStatus,
        normalizedPaymentStatus: s.normalizedPaymentStatus,
        eligibilityStatus: true,
      },
    });

    console.log(`✓ Seeded Matrusri Candidate: ${candidate.studentId} | ${candidate.name} | ${candidate.college} | ${candidate.program}`);
  }

  console.log('\n--- MATRUSRI CANDIDATES SEEDED SUCCESSFULLY! ---\n');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
