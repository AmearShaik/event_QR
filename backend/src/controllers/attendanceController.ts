import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AttendanceService } from '../services/attendanceService';

const prisma = new PrismaClient();

export class AttendanceController {
  /**
   * Endpoint: POST /api/attendance/scan
   */
  static async scan(req: Request, res: Response) {
    try {
      const { token, eventId } = req.body;
      if (!token) {
        return res.status(400).json({ status: 'INVALID', message: 'QR token is required.' });
      }

      // Default event fallback if eventId not specified
      let targetEventId = eventId;
      if (!targetEventId) {
        const activeEvent = await prisma.event.findFirst({ where: { isActive: true } });
        targetEventId = activeEvent ? activeEvent.id : 'attendance';
      }

      const result = await AttendanceService.scanQrToken(token, targetEventId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({
        status: 'INVALID',
        message: err.message || 'Server error processing scan.',
      });
    }
  }

  /**
   * Endpoint: GET /api/admin/attendance
   */
  static async listAttendance(req: Request, res: Response) {
    try {
      const { search, eventId, page = '1', limit = '50' } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 50;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (eventId && typeof eventId === 'string') {
        where.eventId = eventId;
      }

      if (search && typeof search === 'string') {
        const query = search.trim();
        where.candidate = {
          OR: [
            { studentId: { contains: query } },
            { name: { contains: query } },
            { program: { contains: query } },
          ],
        };
      }

      const [totalCount, records] = await Promise.all([
        prisma.attendance.count({ where }),
        prisma.attendance.findMany({
          where,
          include: {
            candidate: true,
            event: true,
          },
          orderBy: { entryTime: 'desc' },
          skip,
          take: limitNum,
        }),
      ]);

      const formatted = records.map((r) => ({
        id: r.id,
        candidateId: r.candidateId,
        studentId: r.candidate.studentId,
        candidateName: r.candidate.name,
        program: r.candidate.program,
        paymentStatus: r.candidate.paymentStatus,
        eligibilityStatus: r.candidate.eligibilityStatus,
        eventId: r.eventId,
        eventName: r.event.name,
        entryTime: r.entryTime.toISOString(),
        status: r.status,
      }));

      return res.json({
        records: formatted,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error listing attendance records.' });
    }
  }

  /**
   * Endpoint: GET /api/admin/attendance/export-csv
   */
  static async exportCSV(req: Request, res: Response) {
    try {
      const records = await prisma.attendance.findMany({
        include: { candidate: true, event: true },
        orderBy: { entryTime: 'desc' },
      });

      let csv = 'ID,Student ID,Candidate Name,Program,Payment Status,Event,Entry Time,Status\n';
      for (const r of records) {
        csv += `"${r.id}","${r.candidate.studentId}","${r.candidate.name}","${r.candidate.program}","${r.candidate.paymentStatus}","${r.event.name}","${r.entryTime.toISOString()}","${r.status}"\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="Graduation-Attendance-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'CSV export error' });
    }
  }
}
