const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getDashboardStats(req, res) {
  try {
    const totalCandidates = await prisma.candidate.count();
    const eligibleCandidates = await prisma.candidate.count({ where: { eligibilityStatus: true } });
    const notEligibleCandidates = await prisma.candidate.count({ where: { eligibilityStatus: false } });

    const paidCandidates = await prisma.candidate.count({ where: { normalizedPaymentStatus: 'PAID' } });
    const notPaidCandidates = await prisma.candidate.count({ where: { normalizedPaymentStatus: 'NOT_PAID' } });
    const partiallyPaidCandidates = await prisma.candidate.count({ where: { normalizedPaymentStatus: 'PARTIALLY_PAID' } });

    const qrGeneratedCount = await prisma.qrToken.count({ where: { isActive: true } });

    const activeEvent =
      (await prisma.event.findFirst({ where: { isActive: true } })) ||
      (await prisma.event.findFirst());

    const attendanceCount = activeEvent
      ? await prisma.attendance.count({ where: { eventId: activeEvent.id } })
      : await prisma.attendance.count();

    const remainingEligible = Math.max(0, eligibleCandidates - attendanceCount);
    const attendanceRate = eligibleCandidates > 0 ? ((attendanceCount / eligibleCandidates) * 100).toFixed(1) : '0.0';

    const programGroups = await prisma.candidate.groupBy({
      by: ['program'],
      _count: {
        id: true,
      },
    });

    const programBreakdown = programGroups.map((p) => ({
      program: p.program,
      count: p._count.id,
    }));

    return res.json({
      stats: {
        totalCandidates,
        eligibleCandidates,
        notEligibleCandidates,
        paidCandidates,
        notPaidCandidates,
        partiallyPaidCandidates,
        qrGeneratedCount,
        attendanceCount,
        remainingEligible,
        attendanceRate,
        activeEvent: activeEvent ? { id: activeEvent.id, name: activeEvent.name, slug: activeEvent.slug } : null,
        programBreakdown,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
}

module.exports = { getDashboardStats };
