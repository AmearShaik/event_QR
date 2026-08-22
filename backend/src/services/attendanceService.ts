import { PrismaClient } from '@prisma/client';
import { ScanResponse } from '../types';

const prisma = new PrismaClient();

export class AttendanceService {
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
      update: { name: 'Graduation Kit Allocation', requiresPayment: true, isActive: true },
      create: {
        slug: 'kit-allocation',
        name: 'Graduation Kit Allocation',
        description: 'Graduation gown and kit distribution for paid candidates only',
        requiresPayment: true,
        isActive: true,
      },
    });

    return { entryEvent, kitEvent };
  }

  /**
   * Performs real-time backend validation for Gate Entry or Kit Allocation.
   * Single QR code works for both checkpoints with dedicated duplicate prevention.
   */
  static async scanQrToken(token: string, scanModeOrEventId?: string): Promise<ScanResponse> {
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
    } else if (mode === 'entry' || mode === 'attendance' || mode === entryEvent.id || mode.includes('entry')) {
      targetEvent = entryEvent;
    } else if (scanModeOrEventId) {
      const customEvent = await prisma.event.findFirst({
        where: {
          OR: [{ id: scanModeOrEventId }, { slug: scanModeOrEventId }],
        },
      });
      if (customEvent) {
        targetEvent = customEvent;
      }
    }

    const isKitMode = targetEvent.slug === 'kit-allocation' || targetEvent.requiresPayment;

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

  private static async processCandidateAttendance(
    candidate: any,
    qrTokenId: string,
    event: any,
    isKitMode: boolean
  ): Promise<ScanResponse> {
    const isPaid =
      candidate.normalizedPaymentStatus === 'PAID' ||
      (candidate.paymentStatus && candidate.paymentStatus.toLowerCase().includes('paid') && !candidate.paymentStatus.toLowerCase().includes('unpaid'));

    // Step 2: Payment check for Kit Allocation
    if (isKitMode && !isPaid) {
      return {
        status: 'NOT_ELIGIBLE',
        message: `KIT ALLOCATION DENIED: Fee status is "${candidate.paymentStatus || 'Unpaid'}". Graduation kit is strictly for Paid candidates.`,
        candidate: {
          studentId: candidate.studentId,
          name: candidate.name,
          program: candidate.program,
        },
        event: event.name,
      };
    }

    // Step 3: Duplicate scan check for this specific event
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
          message: `KIT ALREADY ALLOCATED: Graduation kit was already collected at ${timeStr}.`,
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
        message: `ALREADY SCANNED: Gate entry was already recorded at ${timeStr}.`,
        candidate: {
          studentId: candidate.studentId,
          name: candidate.name,
          program: candidate.program,
        },
        event: event.name,
        entryTime: existing.entryTime.toISOString(),
      };
    }

    // Step 4: Record new scan
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
        ? `Graduation Kit Allocated to ${candidate.name} (${candidate.studentId})!`
        : `Gate Entry Verified for ${candidate.name} (${candidate.studentId})!`;

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
    } catch (err: any) {
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
