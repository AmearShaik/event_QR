import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class QrService {
  /**
   * Generates a cryptographically secure random token (64 hex characters).
   * Does NOT encode Student ID, Name, Phone, Email, or payment data into the QR.
   */
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Retrieves or creates a single active QR token for an eligible candidate & event.
   * If candidate is not eligible, throws an error or returns null.
   */
  static async getOrCreateActiveToken(candidateId: string, eventId: string): Promise<string> {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || !candidate.eligibilityStatus || candidate.normalizedPaymentStatus !== 'PAID') {
      throw new Error('Candidate is not eligible for QR generation');
    }

    // Check if an active token already exists for candidate + event
    const existingToken = await prisma.qrToken.findFirst({
      where: {
        candidateId,
        eventId,
        isActive: true,
      },
    });

    if (existingToken) {
      return existingToken.token;
    }

    // Deactivate any old tokens for this candidate/event to ensure exactly ONE active token
    await prisma.qrToken.updateMany({
      where: { candidateId, eventId },
      data: { isActive: false },
    });

    // Create new secure token
    const tokenStr = this.generateSecureToken();
    const newToken = await prisma.qrToken.create({
      data: {
        candidateId,
        eventId,
        token: tokenStr,
        isActive: true,
      },
    });

    return newToken.token;
  }
}
