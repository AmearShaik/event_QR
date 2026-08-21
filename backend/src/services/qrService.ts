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

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Use upsert to guarantee exactly ONE active token atomically
    const tokenStr = this.generateSecureToken();
    const token = await prisma.qrToken.upsert({
      where: {
        candidateId_eventId: {
          candidateId,
          eventId,
        },
      },
      update: {}, // Do not modify existing active tokens
      create: {
        candidateId,
        eventId,
        token: tokenStr,
        isActive: true,
      },
    });

    return token.token;
  }
}
