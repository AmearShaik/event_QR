const { processGateScan } = require('../services/attendanceService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function scanQrCodeToken(req, res) {
  try {
    const { qrToken, eventId } = req.body;
    const scannedByUserId = req.user ? req.user.userId : null;

    if (!qrToken) {
      return res.status(400).json({ status: 'INVALID', message: 'QR Code token is required.' });
    }

    const result = await processGateScan(qrToken, eventId || 'attendance', scannedByUserId);

    if (result.status === 'SUCCESS') {
      return res.status(200).json(result);
    } else if (result.status === 'DUPLICATE') {
      return res.status(409).json(result);
    } else if (result.status === 'NOT_ELIGIBLE') {
      return res.status(403).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Gate scan error:', error);
    return res.status(500).json({ status: 'INVALID', message: 'Server error verifying scan.' });
  }
}

async function getAttendanceLogs(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const eventId = req.query.eventId ? String(req.query.eventId) : undefined;

    const where = {};
    if (eventId) where.eventId = eventId;

    const total = await prisma.attendance.count({ where });

    const records = await prisma.attendance.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { scannedAt: 'desc' },
      include: {
        candidate: true,
        event: true,
        scannedBy: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    return res.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Get attendance logs error:', error);
    return res.status(500).json({ error: 'Failed to retrieve attendance logs.' });
  }
}

async function exportAttendanceCSV(req, res) {
  try {
    const logs = await prisma.attendance.findMany({
      orderBy: { scannedAt: 'asc' },
      include: {
        candidate: true,
        event: true,
        scannedBy: true,
      },
    });

    let csvContent = 'Timestamp,Student ID,Candidate Name,Program/Course,Payment Status,Eligibility Status,Event Name,Scanned By\n';

    logs.forEach((log) => {
      const timestamp = new Date(log.scannedAt).toISOString();
      const studentId = `"${log.candidate.studentId}"`;
      const candidateName = `"${log.candidate.name}"`;
      const program = `"${log.candidate.program}"`;
      const paymentStatus = `"${log.candidate.paymentStatus}"`;
      const eligibility = log.candidate.eligibilityStatus ? 'ELIGIBLE' : 'NOT_ELIGIBLE';
      const eventName = `"${log.event.name}"`;
      const scannedBy = `"${log.scannedBy ? log.scannedBy.name : 'System Gateway'}"`;

      csvContent += `${timestamp},${studentId},${candidateName},${program},${paymentStatus},${eligibility},${eventName},${scannedBy}\n`;
    });

    const dateStr = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Graduation-Day-2026-Attendance-Audit-${dateStr}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error);
    return res.status(500).json({ error: 'Failed to export CSV audit logs.' });
  }
}

module.exports = { scanQrCodeToken, getAttendanceLogs, exportAttendanceCSV };
