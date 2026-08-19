import { PrismaClient } from '@prisma/client';
import { ScanResponse } from '../types';

const prisma = new PrismaClient();

export class AttendanceService {
  /**
   * Performs real-time backend validation for an entrance scan.
   * Every scan executes fresh eligibility/payment/QR/event validation against database master data.
   */
  static async scanQrToken(token: string, eventIdentifier: string): Promise<ScanResponse> {
    if (!token || typeof token !== 'string') {
      return {
        status: 'INVALID',
        message: 'Invalid QR code token.',
      };
    }

    // Step 1: Find QR token
    const qrToken = await prisma.qrToken.findUnique({
      where: { token: token.trim() },
      include: { candidate: true },
    });

    if (!qrToken) {
      return {
        status: 'INVALID',
        message: 'This QR code is not recognized.',
      };
    }

    // Step 2: QR active check
    if (!qrToken.isActive) {
      return {
        status: 'INVALID',
        reason: 'QR_DISABLED',
        message: 'This QR code is no longer active.',
      };
    }

    // Step 3: Find Event (by ID or Slug)
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id: eventIdentifier }, { slug: eventIdentifier }],
      },
    });

    if (!event) {
      return {
        status: 'EVENT_INACTIVE',
        message: 'Specified event does not exist.',
      };
    }

    if (!event.isActive) {
      return {
        status: 'EVENT_INACTIVE',
        message: 'Event is currently inactive.',
      };
    }

    // Step 4: Event matching check
    if (qrToken.eventId !== event.id) {
      return {
        status: 'WRONG_EVENT',
        message: 'QR token belongs to a different event.',
      };
    }

    // Step 5: Candidate check
    const candidate = qrToken.candidate;
    if (!candidate) {
      return {
        status: 'INVALID',
        message: 'Candidate record not found.',
      };
    }

    // Step 6: Payment & Eligibility Check (Fresh backend check)
    if (candidate.normalizedPaymentStatus === 'NOT_PAID') {
      return {
        status: 'NOT_ELIGIBLE',
        reason: 'NOT_PAID',
        message: 'Payment status: Not Paid.',
        candidate: {
          studentId: candidate.studentId,
          name: candidate.name,
          program: candidate.program,
        },
      };
    }

    if (candidate.normalizedPaymentStatus === 'PARTIALLY_PAID') {
      return {
        status: 'NOT_ELIGIBLE',
        reason: 'PARTIALLY_PAID',
        message: 'Payment status: Partially Paid.',
        candidate: {
          studentId: candidate.studentId,
          name: candidate.name,
          program: candidate.program,
        },
      };
    }

    if (!candidate.eligibilityStatus || candidate.normalizedPaymentStatus !== 'PAID') {
      return {
        status: 'NOT_ELIGIBLE',
        reason: 'NOT_ELIGIBLE',
        message: 'Candidate is not eligible for entrance.',
        candidate: {
          studentId: candidate.studentId,
          name: candidate.name,
          program: candidate.program,
        },
      };
    }

    // Step 7: Duplicate check before insertion
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        candidateId_eventId: {
          candidateId: candidate.id,
          eventId: event.id,
        },
      },
    });

    if (existingAttendance) {
      return {
        status: 'DUPLICATE',
        message: 'Attendance was already recorded for this candidate.',
        candidate: {
          studentId: candidate.studentId,
          name: candidate.name,
          program: candidate.program,
        },
        event: event.name,
        entryTime: existingAttendance.entryTime.toISOString(),
      };
    }

    // Step 8: Database insertion with unique constraint error handling
    try {
      const attendance = await prisma.attendance.create({
        data: {
          candidateId: candidate.id,
          eventId: event.id,
          qrTokenId: qrToken.id,
          status: 'SUCCESS',
        },
      });

      return {
        status: 'SUCCESS',
        message: 'Attendance recorded successfully.',
        candidate: {
          studentId: candidate.studentId,
          name: candidate.name,
          program: candidate.program,
        },
        event: event.name,
        entryTime: attendance.entryTime.toISOString(),
      };
    } catch (err: any) {
      // Prisma error code P2002 is unique constraint violation
      if (err.code === 'P2002') {
        const recorded = await prisma.attendance.findUnique({
          where: {
            candidateId_eventId: {
              candidateId: candidate.id,
              eventId: event.id,
            },
          },
        });
        return {
          status: 'DUPLICATE',
          message: 'Attendance was already recorded for this candidate.',
          candidate: {
            studentId: candidate.studentId,
            name: candidate.name,
            program: candidate.program,
          },
          event: event.name,
          entryTime: recorded?.entryTime.toISOString(),
        };
      }
      throw err;
    }
  }
}
