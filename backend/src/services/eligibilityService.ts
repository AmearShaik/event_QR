import { NormalizedPaymentStatus } from '../../../shared/types';

export class EligibilityService {
  /**
   * Normalizes arbitrary payment status string from CSV/XLSX.
   * Handles variations in casing, whitespace, and known typos like "Partiallly Paid".
   */
  static normalizePaymentStatus(rawStatus: string | null | undefined): {
    normalizedStatus: NormalizedPaymentStatus;
    correctedSpelling: boolean;
  } {
    if (!rawStatus || typeof rawStatus !== 'string') {
      return { normalizedStatus: 'NOT_PAID', correctedSpelling: false };
    }

    const trimmed = rawStatus.trim().toLowerCase().replace(/_/g, ' ');

    // Match PAID variations
    if (trimmed === 'paid') {
      return { normalizedStatus: 'PAID', correctedSpelling: false };
    }

    // Match PARTIALLY PAID variations including "partiallly paid"
    if (
      trimmed === 'partially paid' ||
      trimmed === 'partiallly paid' || // Prompt explicit typo requirement
      trimmed === 'partial paid' ||
      trimmed === 'partiallypaid'
    ) {
      const isTypo = trimmed === 'partiallly paid';
      return { normalizedStatus: 'PARTIALLY_PAID', correctedSpelling: isTypo };
    }

    // Match NOT PAID variations
    if (
      trimmed === 'not paid' ||
      trimmed === 'unpaid' ||
      trimmed === 'notpaid'
    ) {
      return { normalizedStatus: 'NOT_PAID', correctedSpelling: false };
    }

    // Genuinely unknown values default to NOT_PAID
    return { normalizedStatus: 'NOT_PAID', correctedSpelling: false };
  }

  /**
   * Derives boolean eligibility based strictly on backend business rule:
   * ONLY normalized "PAID" status is ELIGIBLE.
   */
  static calculateEligibility(normalizedStatus: NormalizedPaymentStatus): boolean {
    return normalizedStatus === 'PAID';
  }
}
