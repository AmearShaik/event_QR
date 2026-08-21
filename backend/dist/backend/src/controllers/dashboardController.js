"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DashboardController {
    static async getStats(req, res) {
        try {
            const activeEvent = await prisma.event.findFirst({ where: { isActive: true } });
            const activeEventId = activeEvent ? activeEvent.id : undefined;
            const [totalCandidates, paidCandidates, notPaidCandidates, partiallyPaidCandidates, eligibleCandidates, notEligibleCandidates, qrGeneratedCount, attendanceCount, attendedPaidCount, attendedNotPaidCount, programBreakdown,] = await Promise.all([
                prisma.candidate.count(),
                prisma.candidate.count({ where: { normalizedPaymentStatus: 'PAID' } }),
                prisma.candidate.count({ where: { normalizedPaymentStatus: 'NOT_PAID' } }),
                prisma.candidate.count({ where: { normalizedPaymentStatus: 'PARTIALLY_PAID' } }),
                prisma.candidate.count({ where: { eligibilityStatus: true } }),
                prisma.candidate.count({ where: { eligibilityStatus: false } }),
                prisma.qrToken.count({ where: { isActive: true } }),
                activeEventId
                    ? prisma.attendance.count({ where: { eventId: activeEventId } })
                    : prisma.attendance.count(),
                activeEventId
                    ? prisma.attendance.count({ where: { eventId: activeEventId, candidate: { normalizedPaymentStatus: 'PAID' } } })
                    : prisma.attendance.count({ where: { candidate: { normalizedPaymentStatus: 'PAID' } } }),
                activeEventId
                    ? prisma.attendance.count({ where: { eventId: activeEventId, candidate: { normalizedPaymentStatus: { in: ['NOT_PAID', 'PARTIALLY_PAID'] } } } })
                    : prisma.attendance.count({ where: { candidate: { normalizedPaymentStatus: { in: ['NOT_PAID', 'PARTIALLY_PAID'] } } } }),
                prisma.candidate.groupBy({
                    by: ['program'],
                    _count: { id: true },
                }),
            ]);
            const remainingEligible = Math.max(0, eligibleCandidates - attendanceCount);
            const attendanceRate = eligibleCandidates > 0 ? (attendanceCount / eligibleCandidates) * 100 : 0;
            return res.json({
                totalCandidates,
                paidCandidates,
                notPaidCandidates,
                partiallyPaidCandidates,
                eligibleCandidates,
                notEligibleCandidates,
                qrGeneratedCount,
                attendanceCount,
                attendedPaidCount,
                attendedNotPaidCount,
                remainingEligible,
                attendanceRate: parseFloat(attendanceRate.toFixed(2)),
                activeEvent: activeEvent ? { id: activeEvent.id, name: activeEvent.name } : null,
                programBreakdown: programBreakdown.map((p) => ({
                    program: p.program,
                    count: p._count.id,
                })),
            });
        }
        catch (err) {
            return res.status(500).json({ error: err.message || 'Error calculating dashboard statistics.' });
        }
    }
}
exports.DashboardController = DashboardController;
