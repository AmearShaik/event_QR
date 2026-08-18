import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';
import { EligibilityService } from '../services/eligibilityService';
import { QrService } from '../services/qrService';
import { ImportService } from '../services/importService';

const prisma = new PrismaClient();

let adminToken: string;

beforeAll(async () => {
  // Reset test database records
  await prisma.attendance.deleteMany();
  await prisma.qrToken.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Create admin account
  await request(app).post('/api/auth/login'); // fallback
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin@test.com',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuuu', // mock hash
      name: 'Test Admin',
      role: 'ADMIN',
    },
  });

  // Login to obtain JWT
  const loginRes = await request(app).post('/api/auth/login').send({
    username: 'admin@test.com',
    password: 'wrongpassword', // will fail, so let's issue token directly using JwtUtils
  });

  const { JwtUtils } = await import('../utils/jwt');
  adminToken = JwtUtils.signToken({
    userId: adminUser.id,
    username: adminUser.username,
    role: 'ADMIN',
  });

  // Create active default event
  await prisma.event.create({
    data: {
      slug: 'attendance',
      name: 'Graduation Day 2026',
      isActive: true,
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Graduation Day 2026 E2E Test Suite (Mandatory 7 Test Cases)', () => {

  it('Test 1 — Paid Candidate Flow (Eligible, QR generated, Entrance allowed)', async () => {
    // 1. Create PAID Candidate
    const candidate = await prisma.candidate.create({
      data: {
        studentId: 'TEST_PAID_001',
        name: 'Paid Candidate',
        program: 'BE - CSE',
        paymentStatus: 'Paid',
        normalizedPaymentStatus: 'PAID',
        eligibilityStatus: true,
      },
    });

    // 2. Candidate Verification
    const verifyRes = await request(app)
      .post('/api/candidate/verify')
      .send({ studentId: 'TEST_PAID_001' });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.eligible).toBe(true);
    expect(verifyRes.body.status).toBe('ELIGIBLE');

    // 3. Register & Generate QR Token
    const regRes = await request(app)
      .post('/api/candidate/TEST_PAID_001/register')
      .send({ eventId: 'attendance' });

    expect(regRes.status).toBe(200);
    expect(regRes.body.qrToken).toBeDefined();

    const token = regRes.body.qrToken;

    // 4. Entrance Scan
    const scanRes = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ token, eventId: 'attendance' });

    expect(scanRes.status).toBe(200);
    expect(scanRes.body.status).toBe('SUCCESS');
    expect(scanRes.body.candidate.studentId).toBe('TEST_PAID_001');

    // Verify DB Attendance Record
    const attendanceRecord = await prisma.attendance.findFirst({
      where: { candidateId: candidate.id },
    });
    expect(attendanceRecord).toBeDefined();
    expect(attendanceRecord?.status).toBe('SUCCESS');
  });

  it('Test 2 — Duplicate Scan Prevention (Same QR scanned twice)', async () => {
    const candidate = await prisma.candidate.findUnique({
      where: { studentId: 'TEST_PAID_001' },
      include: { qrTokens: true },
    });

    const token = candidate?.qrTokens[0].token;

    // Second Scan of same token
    const scanRes = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ token, eventId: 'attendance' });

    expect(scanRes.status).toBe(200);
    expect(scanRes.body.status).toBe('DUPLICATE');
    expect(scanRes.body.message).toContain('already recorded');

    // Verify only ONE attendance record exists in DB
    const attendanceCount = await prisma.attendance.count({
      where: { candidateId: candidate?.id },
    });
    expect(attendanceCount).toBe(1);
  });

  it('Test 3 — Not Paid Candidate (Not Eligible, No QR, No entrance)', async () => {
    await prisma.candidate.create({
      data: {
        studentId: 'TEST_NOT_PAID_002',
        name: 'Not Paid Candidate',
        program: 'BE - CIV',
        paymentStatus: 'Not Paid',
        normalizedPaymentStatus: 'NOT_PAID',
        eligibilityStatus: false,
      },
    });

    // Verification
    const verifyRes = await request(app)
      .post('/api/candidate/verify')
      .send({ studentId: 'TEST_NOT_PAID_002' });

    expect(verifyRes.body.eligible).toBe(false);
    expect(verifyRes.body.status).toBe('NOT_ELIGIBLE_NOT_PAID');

    // Attempt registration
    const regRes = await request(app)
      .post('/api/candidate/TEST_NOT_PAID_002/register')
      .send({ eventId: 'attendance' });

    expect(regRes.status).toBe(403);
  });

  it('Test 4 — Partially Paid Candidate (Typo Variation Partiallly Paid -> PARTIALLY_PAID)', async () => {
    const { normalizedStatus } = EligibilityService.normalizePaymentStatus('Partiallly Paid');
    expect(normalizedStatus).toBe('PARTIALLY_PAID');

    await prisma.candidate.create({
      data: {
        studentId: 'TEST_PARTIAL_003',
        name: 'Partially Paid Candidate',
        program: 'BE - ECE',
        paymentStatus: 'Partiallly Paid',
        normalizedPaymentStatus: 'PARTIALLY_PAID',
        eligibilityStatus: false,
      },
    });

    const verifyRes = await request(app)
      .post('/api/candidate/verify')
      .send({ studentId: 'TEST_PARTIAL_003' });

    expect(verifyRes.body.eligible).toBe(false);
    expect(verifyRes.body.status).toBe('NOT_ELIGIBLE_PARTIALLY_PAID');
  });

  it('Test 5 — Invalid QR Scan (Unknown random token)', async () => {
    const scanRes = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ token: 'INVALID_RANDOM_TOKEN_123456789', eventId: 'attendance' });

    expect(scanRes.status).toBe(200);
    expect(scanRes.body.status).toBe('INVALID');
    expect(scanRes.body.message).toContain('not recognized');
  });

  it('Test 6 — Dynamic Payment Update Cycle (NOT_PAID -> PAID -> NOT_PAID)', async () => {
    const studentId = 'TEST_DYNAMIC_006';

    // 1. Initial State: NOT_PAID
    const cand = await prisma.candidate.create({
      data: {
        studentId,
        name: 'Dynamic Candidate',
        program: 'BE - MEC',
        paymentStatus: 'Not Paid',
        normalizedPaymentStatus: 'NOT_PAID',
        eligibilityStatus: false,
      },
    });

    // 2. Admin imports update: NOT_PAID -> PAID
    await prisma.candidate.update({
      where: { studentId },
      data: {
        paymentStatus: 'Paid',
        normalizedPaymentStatus: 'PAID',
        eligibilityStatus: true,
      },
    });

    // Candidate registers and obtains QR
    const regRes = await request(app)
      .post(`/api/candidate/${studentId}/register`)
      .send({ eventId: 'attendance' });

    expect(regRes.status).toBe(200);
    const token = regRes.body.qrToken;

    // 3. Admin imports another update: PAID -> NOT_PAID
    await prisma.candidate.update({
      where: { studentId },
      data: {
        paymentStatus: 'Not Paid',
        normalizedPaymentStatus: 'NOT_PAID',
        eligibilityStatus: false,
      },
    });

    // 4. Scan existing token -> Backend MUST reject during scanning!
    const scanRes = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ token, eventId: 'attendance' });

    expect(scanRes.status).toBe(200);
    expect(scanRes.body.status).toBe('NOT_ELIGIBLE');
    expect(scanRes.body.reason).toBe('NOT_PAID');
  });

  it('Test 7 — Duplicate Student ID Validation on File Import', async () => {
    const rawRows = [
      { studentId: 'DUP001', name: 'Candidate 1', program: 'CSE', paymentStatus: 'Paid' },
      { studentId: 'DUP001', name: 'Candidate 1 Duplicate', program: 'CSE', paymentStatus: 'Paid' },
    ];

    const preview = ImportService.generatePreview(rawRows);

    expect(preview.hasErrors).toBe(true);
    expect(preview.invalidRows).toBe(1);
    expect(preview.previewRows[1].error).toContain('Duplicate Student ID in file');
  });

  it('Test 8 — Student Login (Roll Number as User ID & Password)', async () => {
    // 1. Create Paid Candidate for Student Login test
    await prisma.candidate.create({
      data: {
        studentId: 'STUDENT_LOGIN_001',
        name: 'Login Test Student',
        program: 'BE - IT',
        paymentStatus: 'Paid',
        normalizedPaymentStatus: 'PAID',
        eligibilityStatus: true,
      },
    });

    // 2. Student Login with studentId as User ID and Password
    const loginRes = await request(app)
      .post('/api/candidate/login')
      .send({
        studentId: 'STUDENT_LOGIN_001',
        password: 'STUDENT_LOGIN_001',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.eligible).toBe(true);
    expect(loginRes.body.status).toBe('ELIGIBLE');
    expect(loginRes.body.qrToken).toBeDefined();
    expect(loginRes.body.candidate.studentId).toBe('STUDENT_LOGIN_001');

    // 3. Scan student's QR code from Admin Scanner
    const token = loginRes.body.qrToken;
    const scanRes = await request(app)
      .post('/api/attendance/scan')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ token, eventId: 'attendance' });

    expect(scanRes.status).toBe(200);
    expect(scanRes.body.status).toBe('SUCCESS');

    // 4. Student logs in again -> should show attendance record
    const secondLoginRes = await request(app)
      .post('/api/candidate/login')
      .send({
        studentId: 'STUDENT_LOGIN_001',
        password: 'STUDENT_LOGIN_001',
      });

    expect(secondLoginRes.status).toBe(200);
    expect(secondLoginRes.body.attendance).toBeDefined();
    expect(secondLoginRes.body.attendance.status).toBe('SUCCESS');
  });
});
