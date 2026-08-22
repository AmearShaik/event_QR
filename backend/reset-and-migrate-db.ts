import { PrismaClient } from '@prisma/client';
import { PasswordUtils } from './src/utils/password';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('\n===================================================');
  console.log(' RESETTING NEON DATABASE & APPLYING MIGRATIONS');
  console.log('===================================================\n');

  console.log('[1/4] Clearing test attendance records, QR tokens, candidates, and logs...');
  const delAttendance = await prisma.attendance.deleteMany({});
  const delTokens = await prisma.qrToken.deleteMany({});
  const delCandidates = await prisma.candidate.deleteMany({});
  const delLogs = await prisma.importLog.deleteMany({});

  console.log(`✓ Deleted ${delAttendance.count} Attendance records.`);
  console.log(`✓ Deleted ${delTokens.count} QR Tokens.`);
  console.log(`✓ Deleted ${delCandidates.count} Candidates.`);
  console.log(`✓ Deleted ${delLogs.count} Import Logs.`);

  console.log('\n[2/4] Initializing default ceremony events...');
  const entryEvent = await prisma.event.upsert({
    where: { slug: 'attendance' },
    update: {
      name: 'Gate Entry & Attendance',
      description: 'Ceremony entrance pass verification for all registered candidates',
      requiresPayment: false,
      isActive: true,
    },
    create: {
      slug: 'attendance',
      name: 'Gate Entry & Attendance',
      description: 'Ceremony entrance pass verification for all registered candidates',
      requiresPayment: false,
      isActive: true,
    },
  });

  const kitEvent = await prisma.event.upsert({
    where: { slug: 'kit-allocation' },
    update: {
      name: 'Graduation Kit Allocation',
      description: 'Graduation gown and kit distribution checkpoint',
      requiresPayment: false,
      isActive: true,
    },
    create: {
      slug: 'kit-allocation',
      name: 'Graduation Kit Allocation',
      description: 'Graduation gown and kit distribution checkpoint',
      requiresPayment: false,
      isActive: true,
    },
  });
  console.log(`✓ Event 1 Initialized: "${entryEvent.name}" (${entryEvent.slug})`);
  console.log(`✓ Event 2 Initialized: "${kitEvent.name}" (${kitEvent.slug})`);

  console.log('\n[3/4] Seeding verified Administrator accounts...');
  const adminAccounts = [
    { username: 'admin@graduation.edu', password: 'admin@2026', name: 'Graduation Admin', role: 'ADMIN' },
    { username: 'admin', password: 'admin@2026', name: 'Admin', role: 'ADMIN' },
    { username: 'admin@test.com', password: 'admin@2026', name: 'Test Admin', role: 'ADMIN' },
  ];

  for (const acc of adminAccounts) {
    const passwordHash = PasswordUtils.hashPassword(acc.password);
    const user = await prisma.user.upsert({
      where: { username: acc.username.toLowerCase() },
      update: {
        passwordHash,
        name: acc.name,
        role: acc.role,
      },
      create: {
        username: acc.username.toLowerCase(),
        passwordHash,
        name: acc.name,
        role: acc.role,
      },
    });
    console.log(`✓ Admin Verified: "${user.username}" | Password: "${acc.password}" | Role: ${user.role}`);
  }

  console.log('\n===================================================');
  console.log(' [SUCCESS] Neon Database is Fresh, Clean & Ready!');
  console.log('===================================================\n');
}

main()
  .catch((err) => {
    console.error('Error during database reset:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
