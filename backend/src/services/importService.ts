import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import { parse as parseCsv } from 'csv-parse/sync';
import { EligibilityService } from './eligibilityService';
import { ImportPreviewRow, ImportPreviewResponse, ImportConfirmResponse } from '../types';

const prisma = new PrismaClient();

export interface ParsedRowData {
  studentId: string;
  name: string;
  program: string;
  paymentStatus: string;
}

export class ImportService {
  /**
   * Reads raw buffer (CSV or XLSX) and extracts standardized rows.
   */
  static parseFileBuffer(buffer: Buffer, originalFilename: string): ParsedRowData[] {
    const isCsv = originalFilename.endsWith('.csv');
    const rows: ParsedRowData[] = [];

    if (isCsv) {
      const csvString = buffer.toString('utf-8');
      const records = parseCsv(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      for (const rec of records) {
        rows.push(this.extractRowData(rec));
      }
    } else {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = xlsx.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      for (const rec of jsonRows) {
        rows.push(this.extractRowData(rec));
      }
    }

    return rows;
  }

  /**
   * Maps dynamic header names (e.g. Roll No, Student ID, Name, Course, Branch, Status, Payment Status)
   */
  private static extractRowData(rec: Record<string, any>): ParsedRowData {
    const keys = Object.keys(rec);
    const findValue = (possibleHeaders: string[]): string => {
      for (const header of possibleHeaders) {
        const key = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === header.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (key && rec[key] !== undefined && rec[key] !== null) {
          return String(rec[key]).trim();
        }
      }
      return '';
    };

    const studentId = findValue(['student id', 'studentid', 'roll no', 'rollno', 'student_id', 'id']);
    const name = findValue(['candidate name', 'candidatename', 'name', 'student name', 'studentname']);
    
    // Combine Course and Branch if both exist
    const course = findValue(['course', 'program', 'degree']);
    const branch = findValue(['branch', 'department', 'stream']);
    const program = course && branch ? `${course} - ${branch}` : course || branch || 'General';

    const paymentStatus = findValue(['payment status', 'paymentstatus', 'status', 'fee status', 'registaration fee status']);

    return { studentId, name, program, paymentStatus };
  }

  /**
   * Generates validation preview before actual import confirmation.
   */
  static generatePreview(parsedRows: ParsedRowData[]): ImportPreviewResponse {
    const previewRows: ImportPreviewRow[] = [];
    const seenStudentIds = new Set<string>();
    let validCount = 0;
    let invalidCount = 0;
    let hasErrors = false;

    parsedRows.forEach((row, index) => {
      const rowNumber = index + 1;
      const studentId = row.studentId;
      const name = row.name;
      const paymentStatus = row.paymentStatus;
      const program = row.program;

      const { normalizedStatus, correctedSpelling } = EligibilityService.normalizePaymentStatus(paymentStatus);
      const eligibility = EligibilityService.calculateEligibility(normalizedStatus);

      let warning: string | undefined;
      let error: string | undefined;
      let isValid = true;

      // Validation Checks
      if (!studentId) {
        error = 'Missing Student ID';
        isValid = false;
      } else if (seenStudentIds.has(studentId)) {
        error = `Duplicate Student ID in file: ${studentId}`;
        isValid = false;
      } else if (!name) {
        error = 'Missing Candidate Name';
        isValid = false;
      } else if (!paymentStatus) {
        warning = 'Missing payment status; defaulted to NOT_PAID';
      }

      if (correctedSpelling) {
        warning = warning ? `${warning}; Corrected spelling variation` : 'Corrected spelling variation';
      }

      if (studentId) {
        seenStudentIds.add(studentId);
      }

      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
        hasErrors = true;
      }

      previewRows.push({
        rowNumber,
        studentId: studentId || 'N/A',
        name: name || 'N/A',
        program,
        paymentStatus,
        normalizedPaymentStatus: normalizedStatus,
        eligibility,
        isValid,
        warning,
        error,
      });
    });

    return {
      totalRows: parsedRows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      previewRows,
      hasErrors,
    };
  }

  /**
   * Confirms import and upserts candidate records by Student ID.
   */
  static async confirmImport(
    previewRows: ImportPreviewRow[],
    filename: string
  ): Promise<ImportConfirmResponse> {
    let newCandidates = 0;
    let updatedCandidates = 0;
    let unchangedCandidates = 0;
    let rejectedRows = 0;
    let duplicateStudentIds = 0;

    for (const row of previewRows) {
      if (!row.isValid) {
        rejectedRows++;
        if (row.error?.includes('Duplicate Student ID')) {
          duplicateStudentIds++;
        }
        continue;
      }

      const existingCandidate = await prisma.candidate.findUnique({
        where: { studentId: row.studentId },
      });

      const normalizedStatus = row.normalizedPaymentStatus;
      const isEligible = EligibilityService.calculateEligibility(normalizedStatus);

      if (!existingCandidate) {
        await prisma.candidate.create({
          data: {
            studentId: row.studentId,
            name: row.name,
            program: row.program,
            paymentStatus: row.paymentStatus,
            normalizedPaymentStatus: normalizedStatus,
            eligibilityStatus: isEligible,
            registrationStatus: 'NOT_REGISTERED',
          },
        });
        newCandidates++;
      } else {
        const hasChanged =
          existingCandidate.name !== row.name ||
          existingCandidate.program !== row.program ||
          existingCandidate.normalizedPaymentStatus !== normalizedStatus;

        if (hasChanged) {
          await prisma.candidate.update({
            where: { studentId: row.studentId },
            data: {
              name: row.name,
              program: row.program,
              paymentStatus: row.paymentStatus,
              normalizedPaymentStatus: normalizedStatus,
              eligibilityStatus: isEligible,
            },
          });

          // If eligibility changed to false, deactivate active QR tokens
          if (!isEligible) {
            await prisma.qrToken.updateMany({
              where: { candidateId: existingCandidate.id },
              data: { isActive: false },
            });
          }

          updatedCandidates++;
        } else {
          unchangedCandidates++;
        }
      }
    }

    // Record import log
    await prisma.importLog.create({
      data: {
        filename,
        totalRows: previewRows.length,
        newCandidates,
        updatedCandidates,
        unchangedCandidates,
        rejectedRows,
      },
    });

    return {
      totalRows: previewRows.length,
      newCandidates,
      updatedCandidates,
      unchangedCandidates,
      rejectedRows,
      duplicateStudentIds,
    };
  }
}
