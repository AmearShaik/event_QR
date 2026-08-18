import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminCandidatesController {
  static async listCandidates(req: Request, res: Response) {
    try {
      const {
        search,
        program,
        paymentStatus,
        eligibility,
        attendance,
        page = '1',
        limit = '50',
      } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (search && typeof search === 'string') {
        const query = search.trim();
        where.OR = [
          { studentId: { contains: query } },
          { name: { contains: query } },
          { program: { contains: query } },
        ];
      }

      if (program && typeof program === 'string') {
        where.program = program;
      }

      if (paymentStatus && typeof paymentStatus === 'string') {
        where.normalizedPaymentStatus = paymentStatus;
      }

      if (eligibility !== undefined && eligibility !== '') {
        where.eligibilityStatus = eligibility === 'true';
      }

      if (attendance !== undefined && attendance !== '') {
        const attended = attendance === 'true';
        if (attended) {
          where.attendances = { some: {} };
        } else {
          where.attendances = { none: {} };
        }
      }

      const [totalCount, candidates] = await Promise.all([
        prisma.candidate.count({ where }),
        prisma.candidate.findMany({
          where,
          include: {
            qrTokens: { where: { isActive: true } },
            attendances: {
              include: { event: true },
            },
          },
          orderBy: { studentId: 'asc' },
          skip,
          take: limitNum,
        }),
      ]);

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
        attended: c.attendances.length > 0,
        attendanceDetails: c.attendances.map((a) => ({
          eventName: a.event.name,
          entryTime: a.entryTime,
        })),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      return res.json({
        candidates: formatted,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error listing candidates.' });
    }
  }

  static async getCandidateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const candidate = await prisma.candidate.findUnique({
        where: { id },
        include: {
          qrTokens: true,
          attendances: { include: { event: true } },
        },
      });

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found.' });
      }

      return res.json({ candidate });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching candidate.' });
    }
  }
}
