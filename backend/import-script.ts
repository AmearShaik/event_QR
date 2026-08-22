import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { ImportService, ParsedRowData } from './src/services/importService';

const prisma = new PrismaClient();

const FILE_CONFIG: { file: string; sheetName?: string }[] = [
  { file: 'Graduation Day -2026  FEE STATUS 20-08-2026 - Group.xlsx', sheetName: 'ListofStudents-20.08.2026' },
];

function parseXlsxSheet(buffer: Buffer, sheetName?: string): ParsedRowData[] {
  const workbook = xlsx.read(buffer, { type: 'buffer' });

  console.log(`  ↳ Available sheets: [${workbook.SheetNames.map(s => `"${s}"`).join(', ')}]`);

  // Pick the specified sheet, or fall back to the first one
  const targetSheet = sheetName && workbook.SheetNames.includes(sheetName)
    ? sheetName
    : workbook.SheetNames[0];

  if (sheetName && !workbook.SheetNames.includes(sheetName)) {
    console.log(`  ⚠️  Sheet "${sheetName}" not found! Falling back to: "${targetSheet}"`);
  }

  console.log(`  ↳ Reading sheet: "${targetSheet}"`);
  const worksheet = workbook.Sheets[targetSheet];
  const jsonRows = xlsx.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (jsonRows.length === 0) {
    console.log(`  ⚠️  Sheet is empty.`);
    return [];
  }

  console.log(`  ↳ Columns detected: [${Object.keys(jsonRows[0]).join(', ')}]`);
  console.log(`  ↳ First row sample:`, JSON.stringify(jsonRows[0]));

  const rows: ParsedRowData[] = jsonRows.map((rec) => {
    const keys = Object.keys(rec);
    const findValue = (possibleHeaders: string[]): string => {
      for (const header of possibleHeaders) {
        const key = keys.find(
          (k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === header.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        if (key && rec[key] !== undefined && rec[key] !== null && String(rec[key]).trim() !== '') {
          return String(rec[key]).trim();
        }
      }
      return '';
    };

    const studentId = findValue(['student id', 'studentid', 'roll no', 'rollno', 'student_id', 'hallticket', 'hall ticket', 'sno', 'sno.', 'srno', 'regno', 'reg no']);
    const name = findValue(['candidate name', 'candidatename', 'name', 'student name', 'studentname', 'sname']);
    const degree = findValue(['course', 'program', 'degree', 'be', 'btech', 'ug']);
    const branch = findValue(['branch', 'department', 'stream', 'cse', 'ece', 'mech', 'civil', 'eee', 'dept']);
    const program = degree && branch ? `${degree} - ${branch}` : degree || branch || 'General';
    const paymentStatus = findValue(['payment status', 'paymentstatus', 'status', 'fee status', 'feestatus', 'paid status', 'registaration fee status', 'reg fee status']);

    return { studentId, name, program, paymentStatus };
  });

  return rows.filter((r) => r.studentId);
}

async function main() {
  const dataPath = path.join(__dirname, '..');
  console.log('Starting direct database import...\n');

  for (const config of FILE_CONFIG) {
    const filePath = path.join(dataPath, config.file);
    console.log(`Processing: ${config.file}`);

    if (!fs.existsSync(filePath)) {
      console.error(`  ❌ File not found: ${filePath}\n`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      const parsedRows = parseXlsxSheet(buffer, config.sheetName);

      if (parsedRows.length === 0) {
        console.log(`  ⚠️  No readable rows found after filtering.\n`);
        continue;
      }

      console.log(`  ↳ Total rows found: ${parsedRows.length}`);
      const preview = ImportService.generatePreview(parsedRows);
      console.log(`  ↳ Valid: ${preview.validRows} | Invalid: ${preview.invalidRows}`);

      const result = await ImportService.confirmImport(preview.previewRows, config.file);
      console.log(`  ✅ Inserted: ${result.newCandidates}, Updated: ${result.updatedCandidates}\n`);
    } catch (err) {
      console.error(`  ❌ Error:`, err, '\n');
    }
  }

  console.log('Import completed!');
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
