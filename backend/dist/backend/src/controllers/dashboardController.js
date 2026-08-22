"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DashboardController {
    static async getStats(req, res) {
        try {
            const { college } = req.query;
            // Build college filter condition
            const candidateWhere = {};
            if (college && typeof college === 'string' && college.toLowerCase() !== 'all') {
                const query = college.trim().toLowerCase();
                if (query === 'mvsr' || query.includes('mvsr')) {
                    candidateWhere.OR = [
                        { college: { contains: 'MVSR', mode: 'insensitive' } },
                        { studentId: { startsWith: '2451' } },
                    ];
                }
                else if (query === 'matrusri' || query.includes('matrusri') || query === 'mec') {
                    candidateWhere.OR = [
                        { college: { contains: 'Matrusri', mode: 'insensitive' } },
                        { studentId: { startsWith: '1608' } },
                    ];
                }
                else {
                    candidateWhere.college = { contains: college.trim(), mode: 'insensitive' };
                }
            }
            // Find ceremony events
            const entryEvent = await prisma.event.findFirst({
                where: {
                    OR: [{ slug: 'attendance' }, { slug: 'entry' }],
                },
            });
            const kitEvent = await prisma.event.findFirst({
                where: {
                    OR: [{ slug: 'kit-allocation' }, { slug: 'kit' }],
                },
            });
            const entryEventId = entryEvent?.id;
            const kitEventId = kitEvent?.id;
            // Query database with college filter applied
            const [totalCandidates, paidCandidates, notPaidCandidates, eligibleCandidates, qrGeneratedCount, 
            // Entry scans
            entryCount, entryPaidCount, entryUnpaidCount, 
            // Kit Allocation scans
            kitCount, kitPaidCount, kitUnpaidCount, programBreakdown, collegeBreakdown,] = await Promise.all([
                prisma.candidate.count({ where: candidateWhere }),
                prisma.candidate.count({
                    where: {
                        ...candidateWhere,
                        OR: [
                            { normalizedPaymentStatus: 'PAID' },
                            { paymentStatus: { contains: 'Paid', mode: 'insensitive' } },
                        ],
                        NOT: [
                            { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
                            { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
                        ],
                    },
                }),
                prisma.candidate.count({
                    where: {
                        ...candidateWhere,
                        OR: [
                            { normalizedPaymentStatus: { in: ['NOT_PAID', 'PARTIALLY_PAID'] } },
                            { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
                            { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
                        ],
                    },
                }),
                prisma.candidate.count({ where: { ...candidateWhere, eligibilityStatus: true } }),
                prisma.qrToken.count({
                    where: {
                        isActive: true,
                        ...(Object.keys(candidateWhere).length > 0 ? { candidate: candidateWhere } : {}),
                    },
                }),
                // Gate Entry Scans
                entryEventId
                    ? prisma.attendance.count({
                        where: {
                            eventId: entryEventId,
                            ...(Object.keys(candidateWhere).length > 0 ? { candidate: candidateWhere } : {}),
                        },
                    })
                    : 0,
                entryEventId
                    ? prisma.attendance.count({
                        where: {
                            eventId: entryEventId,
                            candidate: {
                                ...candidateWhere,
                                OR: [
                                    { normalizedPaymentStatus: 'PAID' },
                                    { paymentStatus: { contains: 'Paid', mode: 'insensitive' } },
                                ],
                                NOT: [
                                    { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
                                    { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
                                ],
                            },
                        },
                    })
                    : 0,
                entryEventId
                    ? prisma.attendance.count({
                        where: {
                            eventId: entryEventId,
                            candidate: {
                                ...candidateWhere,
                                OR: [
                                    { normalizedPaymentStatus: { in: ['NOT_PAID', 'PARTIALLY_PAID'] } },
                                    { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
                                    { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
                                ],
                            },
                        },
                    })
                    : 0,
                // Kit Allocation Scans
                kitEventId
                    ? prisma.attendance.count({
                        where: {
                            eventId: kitEventId,
                            ...(Object.keys(candidateWhere).length > 0 ? { candidate: candidateWhere } : {}),
                        },
                    })
                    : 0,
                kitEventId
                    ? prisma.attendance.count({
                        where: {
                            eventId: kitEventId,
                            candidate: {
                                ...candidateWhere,
                                OR: [
                                    { normalizedPaymentStatus: 'PAID' },
                                    { paymentStatus: { contains: 'Paid', mode: 'insensitive' } },
                                ],
                                NOT: [
                                    { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
                                    { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
                                ],
                            },
                        },
                    })
                    : 0,
                kitEventId
                    ? prisma.attendance.count({
                        where: {
                            eventId: kitEventId,
                            candidate: {
                                ...candidateWhere,
                                OR: [
                                    { normalizedPaymentStatus: { in: ['NOT_PAID', 'PARTIALLY_PAID'] } },
                                    { paymentStatus: { contains: 'Not', mode: 'insensitive' } },
                                    { paymentStatus: { contains: 'Unpaid', mode: 'insensitive' } },
                                ],
                            },
                        },
                    })
                    : 0,
                prisma.candidate.groupBy({
                    where: candidateWhere,
                    by: ['program'],
                    _count: { id: true },
                }),
                prisma.candidate.groupBy({
                    by: ['college'],
                    _count: { id: true },
                }),
            ]);
            const kitRemainingCount = Math.max(0, totalCandidates - kitCount);
            const entryRemainingCount = Math.max(0, totalCandidates - entryCount);
            const availableColleges = [
                'MVSR Engineering College',
                'Matrusri Engineering College',
                ...collegeBreakdown.map((c) => c.college).filter((c) => c && !['MVSR Engineering College', 'Matrusri Engineering College'].includes(c)),
            ];
            return res.json({
                totalCandidates,
                paidCandidates,
                notPaidCandidates,
                eligibleCandidates,
                qrGeneratedCount,
                selectedCollege: college || 'all',
                availableColleges,
                // Gate Entry
                entryStats: {
                    total: entryCount,
                    paid: entryPaidCount,
                    unpaid: entryUnpaidCount,
                    remaining: entryRemainingCount,
                    percentage: totalCandidates > 0 ? parseFloat(((entryCount / totalCandidates) * 100).toFixed(1)) : 0,
                },
                // Kit Allocation
                kitStats: {
                    total: kitCount,
                    paid: kitPaidCount,
                    unpaid: kitUnpaidCount,
                    remaining: kitRemainingCount,
                    percentage: totalCandidates > 0 ? parseFloat(((kitCount / totalCandidates) * 100).toFixed(1)) : 0,
                },
                // Legacy compatibility fields
                attendanceCount: entryCount,
                attendedPaidCount: entryPaidCount,
                attendedNotPaidCount: entryUnpaidCount,
                remainingEligible: entryRemainingCount,
                attendanceRate: totalCandidates > 0 ? parseFloat(((entryCount / totalCandidates) * 100).toFixed(2)) : 0,
                programBreakdown: programBreakdown.map((p) => ({
                    program: p.program,
                    count: p._count.id,
                })),
                collegeBreakdown: collegeBreakdown.map((c) => ({
                    college: c.college,
                    count: c._count.id,
                })),
            });
        }
        catch (err) {
            console.error('[Dashboard Stats Error]', err);
            return res.status(500).json({ error: err.message || 'Error calculating dashboard statistics.' });
        }
    }
}
exports.DashboardController = DashboardController;
