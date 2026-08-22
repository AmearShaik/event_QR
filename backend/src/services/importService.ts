import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import { parse as parseCsv } from 'csv-parse/sync';
import { EligibilityService } from './eligibilityService';
import { ImportPreviewRow, ImportPreviewResponse, ImportConfirmResponse } from '../types';
import { detectCollege } from '../utils/collegeUtils';

const prisma = new PrismaClient();

export interface ParsedRowData {
  studentId: string;
  name: string;
  program: string;
  college?: string;
  paymentStatus: string;
}

export class ImportService {
  /**
   * Reads raw buffer (CSV or XLSX) and extracts standardized rows.
   */
  static parseFileBuffer(buffer: Buffer, originalFilename: string): ParsedRowData[] {
    const isCsv = originalFilename.toLowerCase().endsWith('.csv');
    const rows: ParsedRowData[] = [];

    if (isCsv) {
      const csvString = buffer.toString('utf-8');
      try {
        const records = parseCsv(csvString, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
        });

        for (const rec of records) {
          const row = this.extractRowData(rec, originalFilename);
          if (row.studentId) {
            rows.push(row);
          }
        }
      } catch {
        // Fallback for CSVs with title rows before header
        const lines = csvString.split(/\r?\n/).filter((l) => l.trim().length > 0);
        let headerIndex = -1;
        let headers: string[] = [];

        for (let i = 0; i < Math.min(10, lines.length); i++) {
          const cells = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
          const cleanCells = cells.map((c) => c.toLowerCase().replace(/[^a-z0-9]/g, ''));
          const hasId = cleanCells.some((c) => ['rollno', 'roll', 'studentid', 'student', 'hallticket', 'sno', 'slno', 'id'].includes(c));
          const hasName = cleanCells.some((c) => ['name', 'candidatename', 'studentname', 'nameofthestudent'].includes(c));
          if (hasId && hasName) {
            headerIndex = i;
            headers = cells;
            break;
          }
        }

        if (headerIndex !== -1) {
          for (let i = headerIndex + 1; i < lines.length; i++) {
            const cells = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
            const rec: Record<string, any> = {};
            headers.forEach((h, idx) => {
              if (h) rec[h] = cells[idx] || '';
            });
            const row = this.extractRowData(rec, originalFilename);
            if (row.studentId) rows.push(row);
          }
        }
      }
    } else {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      let bestRows: ParsedRowData[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const grid = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
        
        let headerRowIndex = -1;
        let headers: string[] = [];

        // Check first few rows for header title keywords (e.g. MATRUSRI, MVSR)
        let sheetTitle = `${originalFilename} ${sheetName}`;
        for (let r = 0; r < Math.min(5, grid.length); r++) {
          const rowStr = (grid[r] || []).join(' ');
          if (rowStr.toLowerCase().includes('matrusri') || rowStr.toLowerCase().includes('mvsr')) {
            sheetTitle += ` ${rowStr}`;
          }
        }

        for (let r = 0; r < Math.min(15, grid.length); r++) {
          const row = grid[r];
          if (!Array.isArray(row)) continue;
          const cleanCells = row.map((c) => String(c).toLowerCase().replace(/[^a-z0-9]/g, ''));
          const hasId = cleanCells.some((c) => ['rollno', 'roll', 'studentid', 'student_id', 'hallticket', 'regno', 'sno', 'slno', 'id'].includes(c));
          const hasName = cleanCells.some((c) => ['name', 'candidatename', 'studentname', 'nameofthestudent', 'sname'].includes(c));
          if (hasId && hasName) {
            headerRowIndex = r;
            headers = row.map((h) => String(h).trim());
            break;
          }
        }

        if (headerRowIndex !== -1) {
          const currentSheetRows: ParsedRowData[] = [];
          for (let i = headerRowIndex + 1; i < grid.length; i++) {
            const row = grid[i];
            if (!row || !row.length) continue;
            const rec: Record<string, any> = {};
            headers.forEach((h, idx) => {
              if (h) rec[h] = row[idx] !== undefined && row[idx] !== null ? String(row[idx]).trim() : '';
            });
            const parsed = this.extractRowData(rec, sheetTitle);
            if (parsed.studentId) {
              currentSheetRows.push(parsed);
            }
          }

          if (currentSheetRows.length > bestRows.length) {
            bestRows = currentSheetRows;
          }
        }
      }

      // If header scanning didn't match, fallback to default sheet_to_json
      if (bestRows.length === 0 && workbook.SheetNames.length > 0) {
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows = xlsx.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });
        for (const rec of jsonRows) {
          const parsed = this.extractRowData(rec, originalFilename);
          if (parsed.studentId) bestRows.push(parsed);
        }
      }

      rows.push(...bestRows);
    }

    return rows;
  }

  /**
   * Maps dynamic header names (e.g. Roll No, Student ID, Name of the Student, Branch, Classification, Payment Status)
   */
  private static extractRowData(rec: Record<string, any>, contextHint?: string): ParsedRowData {
    const keys = Object.keys(rec);
    const findValue = (possibleHeaders: string[]): string => {
      for (const header of possibleHeaders) {
        const targetClean = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        const key = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === targetClean);
        if (key && rec[key] !== undefined && rec[key] !== null) {
          return String(rec[key]).trim();
        }
      }
      return '';
    };

    const studentId = findValue([
      'roll no',
      'rollno',
      'roll no.',
      'student id',
      'studentid',
      'student_id',
      'hallticket',
      'hall ticket',
      'regno',
      'reg no',
      'id'
    ]);

    const name = findValue([
      'name of the student',
      'nameofthestudent',
      'candidate name',
      'candidatename',
      'name',
      'student name',
      'studentname',
      'sname'
    ]);
    
    // Combine Course and Branch if both exist
    const course = findValue(['course', 'program', 'degree', 'be', 'btech', 'ug']);
    const branch = findValue(['branch', 'department', 'stream', 'dept']);
    let program = 'General';
    if (course && branch) {
      program = course.toUpperCase() === branch.toUpperCase() ? course : `${course} - ${branch}`;
    } else if (course) {
      program = course;
    } else if (branch) {
      program = branch;
    }

    let paymentStatus = findValue([
      'status',
      'payment status',
      'paymentstatus',
      'fee status',
      'feestatus',
      'paid status',
      'registaration fee status',
      'registration fee status',
      'reg fee status',
      'classification',
      'division',
      'grade'
    ]);

    // If classification is given without explicit payment status, default to 'Paid'
    if (!paymentStatus || paymentStatus.toLowerCase() === 'distinction' || paymentStatus.toLowerCase().includes('class')) {
      paymentStatus = 'Paid';
    }

    // Auto-detect College based on Student ID prefix or Context Hint
    const college = detectCollege(studentId, contextHint);

    return { studentId, name, program, college, paymentStatus };
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
      const college = row.college || detectCollege(studentId);

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
        warning = 'Missing payment status; defaulted to PAID';
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
        college,
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

    const validRows = previewRows.filter((r) => r.isValid);
    rejectedRows = previewRows.length - validRows.length;
    duplicateStudentIds = previewRows.filter((r) => r.error?.includes('Duplicate Student ID')).length;

    const studentIds = validRows.map((r) => r.studentId);
    const existingCandidates = await prisma.candidate.findMany({
      where: { studentId: { in: studentIds } },
    });

    const existingMap = new Map(existingCandidates.map((c) => [c.studentId, c]));

    const CHUNK_SIZE = 20;
    for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
      const chunk = validRows.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (row) => {
          const existing = existingMap.get(row.studentId);
          const normalizedStatus = row.normalizedPaymentStatus;
          const isEligible = EligibilityService.calculateEligibility(normalizedStatus);
          const college = row.college || detectCollege(row.studentId);

          if (!existing) {
            await prisma.candidate.create({
              data: {
                studentId: row.studentId,
                name: row.name,
                program: row.program,
                college,
                paymentStatus: row.paymentStatus,
                normalizedPaymentStatus: normalizedStatus,
                eligibilityStatus: isEligible,
                registrationStatus: 'NOT_REGISTERED',
              },
            });
            newCandidates++;
          } else {
            const hasChanged =
              existing.name !== row.name ||
              existing.program !== row.program ||
              existing.college !== college ||
              existing.normalizedPaymentStatus !== normalizedStatus;

            if (hasChanged) {
              await prisma.candidate.update({
                where: { studentId: row.studentId },
                data: {
                  name: row.name,
                  program: row.program,
                  college,
                  paymentStatus: row.paymentStatus,
                  normalizedPaymentStatus: normalizedStatus,
                  eligibilityStatus: isEligible,
                },
              });

              if (!isEligible) {
                await prisma.qrToken.updateMany({
                  where: { candidateId: existing.id },
                  data: { isActive: false },
                });
              }

              updatedCandidates++;
            } else {
              unchangedCandidates++;
            }
          }
        })
      );
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
