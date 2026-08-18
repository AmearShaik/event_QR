const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listCandidates(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const program = req.query.program ? String(req.query.program).trim() : '';
    const paymentStatus = req.query.paymentStatus ? String(req.query.paymentStatus).trim() : '';
    const eligibility = req.query.eligibility;
    const attendance = req.query.attendance;

    const where = {};

    if (search) {
      where.OR = [
        { studentId: { contains: search } },
        { name: { contains: search } },
        { program: { contains: search } },
      ];
    }

    if (program) {
      where.program = program;
    }

    if (paymentStatus) {
      where.normalizedPaymentStatus = paymentStatus;
    }

    if (eligibility !== undefined && eligibility !== '') {
      where.eligibilityStatus = eligibility === 'true';
    }

    if (attendance !== undefined && attendance !== '') {
      if (attendance === 'true') {
        where.attendances = { some: {} };
      } else if (attendance === 'false') {
        where.attendances = { none: {} };
      }
    }

    const total = await prisma.candidate.count({ where });

    const candidates = await prisma.candidate.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { studentId: 'asc' },
      include: {
        attendances: {
          include: { event: true },
        },
        qrTokens: {
          where: { isActive: true },
        },
      },
    });

    const formatted = candidates.map((c) => ({
      id: c.id,
      studentId: c.studentId,
      name: c.name,
      program: c.program,
      paymentStatus: c.paymentStatus,
      normalizedPaymentStatus: c.normalizedPaymentStatus,
      eligibilityStatus: c.eligibilityStatus,
      registrationStatus: c.registrationStatus,
      qrGenerated: c.qrTokens.length > 0,
      activeQrToken: c.qrTokens[0] ? c.qrTokens[0].token : null,
      attended: c.attendances.length > 0,
      attendances: c.attendances,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return res.json({
      candidates: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('List candidates error:', error);
    return res.status(500).json({ error: 'Failed to fetch candidate directory.' });
  }
}

async function getCandidateById(req, res) {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        attendances: { include: { event: true } },
        qrTokens: true,
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    return res.json({ candidate });
  } catch (error) {
    console.error('Get candidate error:', error);
    return res.status(500).json({ error: 'Failed to fetch candidate details.' });
  }
}

module.exports = { listCandidates, getCandidateById };
