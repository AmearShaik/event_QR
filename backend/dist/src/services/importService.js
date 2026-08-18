"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportService = void 0;
const client_1 = require("@prisma/client");
const xlsx = __importStar(require("xlsx"));
const sync_1 = require("csv-parse/sync");
const eligibilityService_1 = require("./eligibilityService");
const prisma = new client_1.PrismaClient();
class ImportService {
    /**
     * Reads raw buffer (CSV or XLSX) and extracts standardized rows.
     */
    static parseFileBuffer(buffer, originalFilename) {
        const isCsv = originalFilename.endsWith('.csv');
        const rows = [];
        if (isCsv) {
            const csvString = buffer.toString('utf-8');
            const records = (0, sync_1.parse)(csvString, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
            for (const rec of records) {
                rows.push(this.extractRowData(rec));
            }
        }
        else {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonRows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
            for (const rec of jsonRows) {
                rows.push(this.extractRowData(rec));
            }
        }
        return rows;
    }
    /**
     * Maps dynamic header names (e.g. Roll No, Student ID, Name, Course, Branch, Status, Payment Status)
     */
    static extractRowData(rec) {
        const keys = Object.keys(rec);
        const findValue = (possibleHeaders) => {
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
    static generatePreview(parsedRows) {
        const previewRows = [];
        const seenStudentIds = new Set();
        let validCount = 0;
        let invalidCount = 0;
        let hasErrors = false;
        parsedRows.forEach((row, index) => {
            const rowNumber = index + 1;
            const studentId = row.studentId;
            const name = row.name;
            const paymentStatus = row.paymentStatus;
            const program = row.program;
            const { normalizedStatus, correctedSpelling } = eligibilityService_1.EligibilityService.normalizePaymentStatus(paymentStatus);
            const eligibility = eligibilityService_1.EligibilityService.calculateEligibility(normalizedStatus);
            let warning;
            let error;
            let isValid = true;
            // Validation Checks
            if (!studentId) {
                error = 'Missing Student ID';
                isValid = false;
            }
            else if (seenStudentIds.has(studentId)) {
                error = `Duplicate Student ID in file: ${studentId}`;
                isValid = false;
            }
            else if (!name) {
                error = 'Missing Candidate Name';
                isValid = false;
            }
            else if (!paymentStatus) {
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
            }
            else {
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
    static async confirmImport(previewRows, filename) {
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
            const isEligible = eligibilityService_1.EligibilityService.calculateEligibility(normalizedStatus);
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
            }
            else {
                const hasChanged = existingCandidate.name !== row.name ||
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
                }
                else {
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
exports.ImportService = ImportService;
