function normalizePaymentStatus(rawStatus) {
  if (!rawStatus || typeof rawStatus !== 'string') {
    return { normalizedStatus: 'NOT_PAID', correctedSpelling: false };
  }

  const trimmed = rawStatus.trim().toLowerCase().replace(/_/g, ' ');

  if (trimmed === 'paid') {
    return { normalizedStatus: 'PAID', correctedSpelling: false };
  }

  if (
    trimmed === 'partially paid' ||
    trimmed === 'partiallly paid' ||
    trimmed === 'partial paid' ||
    trimmed === 'partiallypaid'
  ) {
    const isTypo = trimmed === 'partiallly paid';
    return { normalizedStatus: 'PARTIALLY_PAID', correctedSpelling: isTypo };
  }

  if (trimmed === 'not paid' || trimmed === 'unpaid' || trimmed === 'notpaid') {
    return { normalizedStatus: 'NOT_PAID', correctedSpelling: false };
  }

  return { normalizedStatus: 'NOT_PAID', correctedSpelling: false };
}

function calculateEligibility(normalizedStatus) {
  return normalizedStatus === 'PAID';
}

module.exports = { normalizePaymentStatus, calculateEligibility };
