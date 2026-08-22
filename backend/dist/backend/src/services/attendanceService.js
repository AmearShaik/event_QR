"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AttendanceService {
    /**
     * Ensures default ceremony events (Gate Entry & Kit Allocation) exist.
     */
    static async ensureDefaultEvents() {
        const entryEvent = await prisma.event.upsert({
            where: { slug: 'attendance' },
            update: { name: 'Gate Entry & Attendance', requiresPayment: false, isActive: true },
            create: {
                slug: 'attendance',
                name: 'Gate Entry & Attendance',
                description: 'Main ceremony entrance verification for all registered candidates',
                requiresPayment: false,
                isActive: true,
            },
        });
        const kitEvent = await prisma.event.upsert({
            where: { slug: 'kit-allocation' },
            update: { name: 'Graduation Kit Allocation', requiresPayment: false, isActive: true },
            create: {
                slug: 'kit-allocation',
                name: 'Graduation Kit Allocation',
                description: 'Graduation gown and kit distribution for candidates (tracked for both paid and unpaid)',
                requiresPayment: false,
                isActive: true,
            },
        });
        return { entryEvent, kitEvent };
    }
    /**
     * Performs real-time backend validation for Gate Entry or Kit Allocation.
     * Single QR code works for both checkpoints with dedicated duplicate prevention.
     * Kit allocation is allowed for both paid and unpaid candidates, with fee status tracked.
     */
    static async scanQrToken(token, scanModeOrEventId) {
        if (!token || typeof token !== 'string') {
            return {
                status: 'INVALID',
                message: 'Invalid QR code token provided.',
            };
        }
        const { entryEvent, kitEvent } = await this.ensureDefaultEvents();
        // Determine target event based on scan mode or event ID
        let targetEvent = entryEvent;
        const mode = (scanModeOrEventId || '').trim().toLowerCase();
        if (mode === 'kit' || mode === 'kit-allocation' || mode === kitEvent.id || mode.includes('kit')) {
            targetEvent = kitEvent;
        }
        else if (mode === 'entry' || mode === 'attendance' || mode === entryEvent.id || mode.includes('entry')) {
            targetEvent = entryEvent;
        }
        else if (scanModeOrEventId) {
            const customEvent = await prisma.event.findFirst({
                where: {
                    OR: [{ id: scanModeOrEventId }, { slug: scanModeOrEventId }],
                },
            });
            if (customEvent) {
                targetEvent = customEvent;
            }
        }
        const isKitMode = targetEvent.slug === 'kit-allocation' || targetEvent.name.toLowerCase().includes('kit');
        // Step 1: Find QR token and candidate
        const qrToken = await prisma.qrToken.findUnique({
            where: { token: token.trim() },
            include: { candidate: true },
        });
        if (!qrToken || !qrToken.candidate) {
            // Fallback: check if the scanned text is a direct student roll number
            const candidateByRoll = await prisma.candidate.findUnique({
                where: { studentId: token.trim() },
            });
            if (!candidateByRoll) {
                return {
                    status: 'INVALID',
                    message: 'QR code not recognized in official graduation database.',
                };
            }
            // Generate or find QR token for this candidate
            const existingToken = await prisma.qrToken.findFirst({
                where: { candidateId: candidateByRoll.id },
            });
            if (!existingToken) {
                return {
                    status: 'INVALID',
                    message: 'Candidate QR pass has not been initialized.',
                };
            }
            return this.processCandidateAttendance(candidateByRoll, existingToken.id, targetEvent, isKitMode);
        }
        if (!qrToken.isActive) {
            return {
                status: 'INVALID',
                reason: 'QR_DISABLED',
                message: 'This QR code pass has been deactivated.',
            };
        }
        return this.processCandidateAttendance(qrToken.candidate, qrToken.id, targetEvent, isKitMode);
    }
    static async processCandidateAttendance(candidate, qrTokenId, event, isKitMode) {
        const norm = (candidate.normalizedPaymentStatus || '').toUpperCase();
        const raw = (candidate.paymentStatus || '').trim().toLowerCase();
        const isPaid = norm === 'PAID' || (raw === 'paid' || (raw.includes('paid') && !raw.includes('not') && !raw.includes('unpaid') && !raw.includes('due')));
        const displayFeeStatus = isPaid ? 'Paid' : (candidate.paymentStatus || 'Not Paid');
        // Duplicate scan check for this specific checkpoint
        const existing = await prisma.attendance.findUnique({
            where: {
                candidateId_eventId: {
                    candidateId: candidate.id,
                    eventId: event.id,
                },
            },
        });
        if (existing) {
            const timeStr = new Date(existing.entryTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            if (isKitMode) {
                return {
                    status: 'DUPLICATE',
                    message: `KIT ALREADY ALLOCATED: Kit was already collected by ${candidate.name} at ${timeStr}.`,
                    candidate: {
                        studentId: candidate.studentId,
                        name: candidate.name,
                        program: candidate.program,
                    },
                    event: event.name,
                    entryTime: existing.entryTime.toISOString(),
                };
            }
            return {
                status: 'DUPLICATE',
                message: `ALREADY SCANNED: Gate entry was already recorded for ${candidate.name} at ${timeStr}.`,
                candidate: {
                    studentId: candidate.studentId,
                    name: candidate.name,
                    program: candidate.program,
                },
                event: event.name,
                entryTime: existing.entryTime.toISOString(),
            };
        }
        // Step 3: Record new scan
        try {
            const attendance = await prisma.attendance.create({
                data: {
                    candidateId: candidate.id,
                    eventId: event.id,
                    qrTokenId: qrTokenId,
                    status: 'SUCCESS',
                },
            });
            const successMsg = isKitMode
                ? `Graduation Kit Allocated to ${candidate.name} (${displayFeeStatus})`
                : `Gate Entry Verified for ${candidate.name} (${displayFeeStatus})`;
            return {
                status: 'SUCCESS',
                message: successMsg,
                candidate: {
                    studentId: candidate.studentId,
                    name: candidate.name,
                    program: candidate.program,
                },
                event: event.name,
                entryTime: attendance.entryTime.toISOString(),
            };
        }
        catch (err) {
            if (err.code === 'P2002') {
                const existingRec = await prisma.attendance.findUnique({
                    where: {
                        candidateId_eventId: {
                            candidateId: candidate.id,
                            eventId: event.id,
                        },
                    },
                });
                return {
                    status: 'DUPLICATE',
                    message: isKitMode
                        ? 'KIT ALREADY ALLOCATED: Graduation kit has already been claimed.'
                        : 'ALREADY SCANNED: Entrance attendance was already recorded.',
                    candidate: {
                        studentId: candidate.studentId,
                        name: candidate.name,
                        program: candidate.program,
                    },
                    event: event.name,
                    entryTime: existingRec?.entryTime.toISOString(),
                };
            }
            throw err;
        }
    }
}
exports.AttendanceService = AttendanceService;
