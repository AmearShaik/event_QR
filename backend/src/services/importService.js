const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const { normalizePaymentStatus, calculateEligibility } = require('./eligibilityService');

const prisma = new PrismaClient();

function parseBufferToRows(buffer, filename) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet, { defval: '' });
}

function processAndValidateRows(rawRows) {
  const previewRows = [];
  let validCount = 0;
  let invalidCount = 0;

  rawRows.forEach((row, idx) => {
    const studentIdRaw = row['Student ID'] || row['studentId'] || row['Roll No'] || row['Roll Number'] || row['ID'];
    const nameRaw = row['Candidate Name'] || row['Name'] || row['Student Name'] || row['CandidateName'];
    const programRaw = row['Program/Course'] || row['Program'] || row['Course'] || row['Branch'];
    const paymentStatusRaw = row['Payment Status'] || row['PaymentStatus'] || row['Status'] || row['Payment'];

    const studentId = studentIdRaw ? String(studentIdRaw).trim() : '';
    const name = nameRaw ? String(nameRaw).trim() : '';
    const program = programRaw ? String(programRaw).trim() : 'BE';
    const paymentStatus = paymentStatusRaw ? String(paymentStatusRaw).trim() : 'Not Paid';

    let error;
    let isValid = true;
    let warning;

    if (!studentId) {
      isValid = false;
      error = 'Missing Student ID';
    } else if (!name) {
      isValid = false;
      error = 'Missing Candidate Name';
    }

    const { normalizedStatus, correctedSpelling } = normalizePaymentStatus(paymentStatus);
    const eligible = calculateEligibility(normalizedStatus);

    if (correctedSpelling) {
      warning = `Corrected spelling typo: "${paymentStatus}" -> PARTIALLY_PAID`;
    }

    if (isValid) validCount++;
    else invalidCount++;

    previewRows.push({
      rowNumber: idx + 1,
      studentId,
      name,
      program,
      paymentStatus,
      normalizedPaymentStatus: normalizedStatus,
      eligibility: eligible,
      isValid,
      error,
      warning,
    });
  });

  return {
    totalRows: rawRows.length,
    validRows: validCount,
    invalidRows: invalidCount,
    previewRows,
  };
}

async function confirmAndUpsertCandidates(previewRows, filename, importedByUserId) {
  let newCandidates = 0;
  let updatedCandidates = 0;
  let unchangedCandidates = 0;
  let rejectedRows = 0;

  const validRows = previewRows.filter((r) => r.isValid);

  for (const row of validRows) {
    const existing = await prisma.candidate.findUnique({
      where: { studentId: row.studentId },
    });

    if (!existing) {
      await prisma.candidate.create({
        data: {
          studentId: row.studentId,
          name: row.name,
          program: row.program,
          paymentStatus: row.paymentStatus,
          normalizedPaymentStatus: row.normalizedPaymentStatus,
          eligibilityStatus: row.eligibility,
        },
      });
      newCandidates++;
    } else {
      const isChanged =
        existing.name !== row.name ||
        existing.program !== row.program ||
        existing.paymentStatus !== row.paymentStatus ||
        existing.normalizedPaymentStatus !== row.normalizedPaymentStatus ||
        existing.eligibilityStatus !== row.eligibility;

      if (isChanged) {
        await prisma.candidate.update({
          where: { studentId: row.studentId },
          data: {
            name: row.name,
            program: row.program,
            paymentStatus: row.paymentStatus,
            normalizedPaymentStatus: row.normalizedPaymentStatus,
            eligibilityStatus: row.eligibility,
          },
        });
        updatedCandidates++;
      } else {
        unchangedCandidates++;
      }
    }
  }

  rejectedRows = previewRows.length - validRows.length;

  const log = await prisma.importLog.create({
    data: {
      filename: filename || 'candidate_import.csv',
      totalRecords: previewRows.length,
      successRecords: validRows.length,
      failedRecords: rejectedRows,
      importedBy: importedByUserId,
    },
  });

  return {
    logId: log.id,
    totalRows: previewRows.length,
    newCandidates,
    updatedCandidates,
    unchangedCandidates,
    rejectedRows,
  };
}

module.exports = { parseBufferToRows, processAndValidateRows, confirmAndUpsertCandidates };
