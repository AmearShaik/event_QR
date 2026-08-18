"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const client_1 = require("@prisma/client");
const eligibilityService_1 = require("../services/eligibilityService");
const importService_1 = require("../services/importService");
const prisma = new client_1.PrismaClient();
let adminToken;
(0, vitest_1.beforeAll)(async () => {
    // Reset test database records
    await prisma.attendance.deleteMany();
    await prisma.qrToken.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    // Create admin account
    await (0, supertest_1.default)(app_1.default).post('/api/auth/login'); // fallback
    const adminUser = await prisma.user.create({
        data: {
            username: 'admin@test.com',
            passwordHash: '$2a$10$abcdefghijklmnopqrstuuu', // mock hash
            name: 'Test Admin',
            role: 'ADMIN',
        },
    });
    // Login to obtain JWT
    const loginRes = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
        username: 'admin@test.com',
        password: 'wrongpassword', // will fail, so let's issue token directly using JwtUtils
    });
    const { JwtUtils } = await Promise.resolve().then(() => __importStar(require('../utils/jwt')));
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
(0, vitest_1.afterAll)(async () => {
    await prisma.$disconnect();
});
(0, vitest_1.describe)('Graduation Day 2026 E2E Test Suite (Mandatory 7 Test Cases)', () => {
    (0, vitest_1.it)('Test 1 — Paid Candidate Flow (Eligible, QR generated, Entrance allowed)', async () => {
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
        const verifyRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/candidate/verify')
            .send({ studentId: 'TEST_PAID_001' });
        (0, vitest_1.expect)(verifyRes.status).toBe(200);
        (0, vitest_1.expect)(verifyRes.body.eligible).toBe(true);
        (0, vitest_1.expect)(verifyRes.body.status).toBe('ELIGIBLE');
        // 3. Register & Generate QR Token
        const regRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/candidate/TEST_PAID_001/register')
            .send({ eventId: 'attendance' });
        (0, vitest_1.expect)(regRes.status).toBe(200);
        (0, vitest_1.expect)(regRes.body.qrToken).toBeDefined();
        const token = regRes.body.qrToken;
        // 4. Entrance Scan
        const scanRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/attendance/scan')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ token, eventId: 'attendance' });
        (0, vitest_1.expect)(scanRes.status).toBe(200);
        (0, vitest_1.expect)(scanRes.body.status).toBe('SUCCESS');
        (0, vitest_1.expect)(scanRes.body.candidate.studentId).toBe('TEST_PAID_001');
        // Verify DB Attendance Record
        const attendanceRecord = await prisma.attendance.findFirst({
            where: { candidateId: candidate.id },
        });
        (0, vitest_1.expect)(attendanceRecord).toBeDefined();
        (0, vitest_1.expect)(attendanceRecord?.status).toBe('SUCCESS');
    });
    (0, vitest_1.it)('Test 2 — Duplicate Scan Prevention (Same QR scanned twice)', async () => {
        const candidate = await prisma.candidate.findUnique({
            where: { studentId: 'TEST_PAID_001' },
            include: { qrTokens: true },
        });
        const token = candidate?.qrTokens[0].token;
        // Second Scan of same token
        const scanRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/attendance/scan')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ token, eventId: 'attendance' });
        (0, vitest_1.expect)(scanRes.status).toBe(200);
        (0, vitest_1.expect)(scanRes.body.status).toBe('DUPLICATE');
        (0, vitest_1.expect)(scanRes.body.message).toContain('already recorded');
        // Verify only ONE attendance record exists in DB
        const attendanceCount = await prisma.attendance.count({
            where: { candidateId: candidate?.id },
        });
        (0, vitest_1.expect)(attendanceCount).toBe(1);
    });
    (0, vitest_1.it)('Test 3 — Not Paid Candidate (Not Eligible, No QR, No entrance)', async () => {
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
        const verifyRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/candidate/verify')
            .send({ studentId: 'TEST_NOT_PAID_002' });
        (0, vitest_1.expect)(verifyRes.body.eligible).toBe(false);
        (0, vitest_1.expect)(verifyRes.body.status).toBe('NOT_ELIGIBLE_NOT_PAID');
        // Attempt registration
        const regRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/candidate/TEST_NOT_PAID_002/register')
            .send({ eventId: 'attendance' });
        (0, vitest_1.expect)(regRes.status).toBe(403);
    });
    (0, vitest_1.it)('Test 4 — Partially Paid Candidate (Typo Variation Partiallly Paid -> PARTIALLY_PAID)', async () => {
        const { normalizedStatus } = eligibilityService_1.EligibilityService.normalizePaymentStatus('Partiallly Paid');
        (0, vitest_1.expect)(normalizedStatus).toBe('PARTIALLY_PAID');
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
        const verifyRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/candidate/verify')
            .send({ studentId: 'TEST_PARTIAL_003' });
        (0, vitest_1.expect)(verifyRes.body.eligible).toBe(false);
        (0, vitest_1.expect)(verifyRes.body.status).toBe('NOT_ELIGIBLE_PARTIALLY_PAID');
    });
    (0, vitest_1.it)('Test 5 — Invalid QR Scan (Unknown random token)', async () => {
        const scanRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/attendance/scan')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ token: 'INVALID_RANDOM_TOKEN_123456789', eventId: 'attendance' });
        (0, vitest_1.expect)(scanRes.status).toBe(200);
        (0, vitest_1.expect)(scanRes.body.status).toBe('INVALID');
        (0, vitest_1.expect)(scanRes.body.message).toContain('not recognized');
    });
    (0, vitest_1.it)('Test 6 — Dynamic Payment Update Cycle (NOT_PAID -> PAID -> NOT_PAID)', async () => {
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
        const regRes = await (0, supertest_1.default)(app_1.default)
            .post(`/api/candidate/${studentId}/register`)
            .send({ eventId: 'attendance' });
        (0, vitest_1.expect)(regRes.status).toBe(200);
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
        const scanRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/attendance/scan')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ token, eventId: 'attendance' });
        (0, vitest_1.expect)(scanRes.status).toBe(200);
        (0, vitest_1.expect)(scanRes.body.status).toBe('NOT_ELIGIBLE');
        (0, vitest_1.expect)(scanRes.body.reason).toBe('NOT_PAID');
    });
    (0, vitest_1.it)('Test 7 — Duplicate Student ID Validation on File Import', async () => {
        const rawRows = [
            { studentId: 'DUP001', name: 'Candidate 1', program: 'CSE', paymentStatus: 'Paid' },
            { studentId: 'DUP001', name: 'Candidate 1 Duplicate', program: 'CSE', paymentStatus: 'Paid' },
        ];
        const preview = importService_1.ImportService.generatePreview(rawRows);
        (0, vitest_1.expect)(preview.hasErrors).toBe(true);
        (0, vitest_1.expect)(preview.invalidRows).toBe(1);
        (0, vitest_1.expect)(preview.previewRows[1].error).toContain('Duplicate Student ID in file');
    });
});
