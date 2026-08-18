const { PrismaClient } = require('@prisma/client');
const { verifyQrToken } = require('./qrService');

const prisma = new PrismaClient();

async function processGateScan(qrToken, eventSlugOrId, scannedByUserId) {
  let event = await prisma.event.findFirst({
    where: {
      OR: [{ id: eventSlugOrId }, { slug: eventSlugOrId }],
    },
  });

  if (!event) {
    event = await prisma.event.findFirst({ where: { isActive: true } });
  }

  if (!event) {
    return {
      status: 'EVENT_INACTIVE',
      message: 'No active graduation ceremony event found.',
    };
  }

  if (!event.isActive) {
    return {
      status: 'EVENT_INACTIVE',
      message: `Event session "${event.name}" is currently inactive.`,
      event,
    };
  }

  const tokenVerification = await verifyQrToken(qrToken);

  if (!tokenVerification.valid) {
    if (tokenVerification.reason === 'TOKEN_DISABLED') {
      return {
        status: 'QR_DISABLED',
        message: 'This QR code pass has been replaced or invalidated.',
        candidate: tokenVerification.candidate,
      };
    }
    return {
      status: 'INVALID',
      message: 'Invalid QR Code token presented.',
    };
  }

  const candidate = tokenVerification.candidate;
  const qrRecord = tokenVerification.qrRecord;

  if (!candidate.eligibilityStatus) {
    return {
      status: 'NOT_ELIGIBLE',
      message: `Candidate ${candidate.name} is NOT ELIGIBLE due to unpaid or partial fees. Entry Denied.`,
      candidate,
      reason: candidate.normalizedPaymentStatus,
    };
  }

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      candidateId: candidate.id,
      eventId: event.id,
    },
  });

  if (existingAttendance) {
    return {
      status: 'DUPLICATE',
      message: `Candidate ${candidate.name} has ALREADY checked in for ${event.name} at ${new Date(
        existingAttendance.scannedAt
      ).toLocaleTimeString()}.`,
      candidate,
      event,
      scannedAt: existingAttendance.scannedAt,
    };
  }

  try {
    const attendanceData = {
      candidate: { connect: { id: candidate.id } },
      event: { connect: { id: event.id } },
      qrToken: { connect: { id: qrRecord.id } },
    };

    if (scannedByUserId) {
      attendanceData.scannedBy = { connect: { id: scannedByUserId } };
    }

    const attendanceRecord = await prisma.attendance.create({
      data: attendanceData,
    });

    return {
      status: 'SUCCESS',
      message: `ENTRY ALLOWED: Welcome ${candidate.name} (${candidate.program})!`,
      candidate,
      event,
      scannedAt: attendanceRecord.scannedAt,
    };
  } catch (error) {
    if (error.code === 'P2002') {
      const duplicateRecord = await prisma.attendance.findFirst({
        where: {
          candidateId: candidate.id,
          eventId: event.id,
        },
      });

      return {
        status: 'DUPLICATE',
        message: `Candidate ${candidate.name} has ALREADY checked in at entrance gate.`,
        candidate,
        event,
        scannedAt: duplicateRecord ? duplicateRecord.scannedAt : new Date(),
      };
    }
    throw error;
  }
}

module.exports = { processGateScan };
