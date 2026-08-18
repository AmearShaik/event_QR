const app = require('../app');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let server;
let baseUrl;

async function setup() {
  await prisma.attendance.deleteMany({
    where: { candidate: { studentId: 'GD001' } },
  });

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
}

async function teardown() {
  return new Promise((resolve) => {
    server.close(async () => {
      await prisma.$disconnect();
      resolve();
    });
  });
}

async function runTests() {
  console.log('===================================================');
  console.log(' STARTING MANDATORY E2E TEST SUITE FOR QR SYSTEM');
  console.log('===================================================');

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(` ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(` ✕ [FAIL] ${name}`);
      console.error(`   Error details:`, err.message);
      failed++;
    }
  }

  await setup();

  // Test 1: Verify Candidate & Register Pass
  await assertTest('Test 1: Master Candidate Verification & Pass Retrieval (GD001)', async () => {
    const verifyRes = await fetch(`${baseUrl}/api/candidates/verify/GD001`);
    const verifyData = await verifyRes.json();

    if (verifyRes.status !== 200 || !verifyData.eligible) {
      throw new Error(`Expected eligible status 200, got ${verifyRes.status}: ${JSON.stringify(verifyData)}`);
    }

    const regRes = await fetch(`${baseUrl}/api/candidates/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'GD001' }),
    });
    const regData = await regRes.json();

    if (regRes.status !== 200 || !regData.qrToken || regData.qrToken.length !== 64) {
      throw new Error(`Expected active 64-char QR token, got: ${JSON.stringify(regData)}`);
    }
  });

  // Test 2: Paid Candidate Scan Success
  await assertTest('Test 2: Paid Candidate Entrance Scan Verification', async () => {
    const regRes = await fetch(`${baseUrl}/api/candidates/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'GD001' }),
    });
    const { qrToken } = await regRes.json();

    const scanRes = await fetch(`${baseUrl}/api/attendance/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrToken, eventId: 'attendance' }),
    });
    const scanData = await scanRes.json();

    if (scanRes.status !== 200 || scanData.status !== 'SUCCESS') {
      throw new Error(`Expected scan SUCCESS, got ${scanRes.status}: ${JSON.stringify(scanData)}`);
    }
  });

  // Test 3: Not Paid Candidate Verification Rejection
  await assertTest('Test 3: Not Paid Candidate Access Rejection (GD002)', async () => {
    const verifyRes = await fetch(`${baseUrl}/api/candidates/verify/GD002`);
    const verifyData = await verifyRes.json();

    if (verifyRes.status !== 403 || verifyData.eligible !== false || verifyData.reason !== 'NOT_PAID') {
      throw new Error(`Expected NOT_PAID rejection (403), got ${verifyRes.status}: ${JSON.stringify(verifyData)}`);
    }
  });

  // Test 4: Partially Paid Candidate Access Rejection
  await assertTest('Test 4: Partially Paid Candidate Access Rejection (GD003)', async () => {
    const verifyRes = await fetch(`${baseUrl}/api/candidates/verify/GD003`);
    const verifyData = await verifyRes.json();

    if (verifyRes.status !== 403 || verifyData.eligible !== false || verifyData.reason !== 'PARTIALLY_PAID') {
      throw new Error(`Expected PARTIALLY_PAID rejection (403), got ${verifyRes.status}: ${JSON.stringify(verifyData)}`);
    }
  });

  // Test 5: Spelling Correction & Normalization
  await assertTest('Test 5: Typo Normalization Rejection ("Partiallly Paid")', async () => {
    const candidate = await prisma.candidate.findUnique({ where: { studentId: 'GD004' } });
    if (!candidate || candidate.normalizedPaymentStatus !== 'PARTIALLY_PAID') {
      throw new Error(`Expected candidate GD004 normalized to PARTIALLY_PAID, found ${candidate?.normalizedPaymentStatus}`);
    }

    const verifyRes = await fetch(`${baseUrl}/api/candidates/verify/GD004`);
    const verifyData = await verifyRes.json();
    if (verifyRes.status !== 403 || verifyData.eligible !== false) {
      throw new Error(`Expected typo normalized candidate rejection, got ${verifyRes.status}`);
    }
  });

  // Test 6: Duplicate Scan Prevention
  await assertTest('Test 6: Duplicate Gate Entrance Scan Rejection (409 Conflict)', async () => {
    const regRes = await fetch(`${baseUrl}/api/candidates/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'GD001' }),
    });
    const { qrToken } = await regRes.json();

    // Second scan attempt on same token
    const scanRes2 = await fetch(`${baseUrl}/api/attendance/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrToken, eventId: 'attendance' }),
    });
    const scanData2 = await scanRes2.json();

    if (scanRes2.status !== 409 || scanData2.status !== 'DUPLICATE') {
      throw new Error(`Expected DUPLICATE 409 conflict, got ${scanRes2.status}: ${JSON.stringify(scanData2)}`);
    }
  });

  // Test 7: Admin Authentication & Session Check
  await assertTest('Test 7: Admin Authentication & Candidate Master Data Upsert Engine', async () => {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@graduation.edu', password: 'Admin@2026Password!' }),
    });
    const loginData = await loginRes.json();

    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }

    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const meData = await meRes.json();

    if (meRes.status !== 200 || !meData.user) {
      throw new Error(`Admin session validation failed: ${JSON.stringify(meData)}`);
    }

    const statsRes = await fetch(`${baseUrl}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const statsData = await statsRes.json();

    if (statsRes.status !== 200 || typeof statsData.stats.totalCandidates !== 'number') {
      throw new Error(`Expected dashboard stats 200, got ${statsRes.status}: ${JSON.stringify(statsData)}`);
    }
  });

  // Test 8: Hyphen-less Flexible Roll Number Search (e.g. 245122732005 & 245122732001)
  await assertTest('Test 8: Hyphen-Agnostic Flexible Roll Number Match ("245122732005" & "245122732001")', async () => {
    const verifyRes1 = await fetch(`${baseUrl}/api/candidates/verify/245122732005`);
    const data1 = await verifyRes1.json();

    if (!data1.candidate || data1.candidate.studentId !== '2451-22-732-005') {
      throw new Error(`Expected "245122732005" to match "2451-22-732-005", got: ${JSON.stringify(data1)}`);
    }

    const verifyRes2 = await fetch(`${baseUrl}/api/candidates/verify/245122732001`);
    const data2 = await verifyRes2.json();

    if (!data2.candidate || data2.candidate.studentId !== '2451-22-732-001') {
      throw new Error(`Expected "245122732001" to match "2451-22-732-001", got: ${JSON.stringify(data2)}`);
    }
  });

  // Test 9: Student Login with Roll Number as User ID & Password
  await assertTest('Test 9: Student Login with Roll Number as User ID & Password (Instant QR Generation)', async () => {
    const loginRes = await fetch(`${baseUrl}/api/candidate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 'GD001', password: 'GD001' }),
    });
    const loginData = await loginRes.json();

    if (loginRes.status !== 200 || !loginData.eligible || !loginData.qrToken) {
      throw new Error(`Expected student login 200 with QR token, got ${loginRes.status}: ${JSON.stringify(loginData)}`);
    }
  });

  await teardown();

  console.log('===================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} TOTAL`);
  console.log('===================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test execution failure:', e);
  process.exit(1);
});
