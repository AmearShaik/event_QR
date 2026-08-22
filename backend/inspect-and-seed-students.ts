import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { ImportService } from './src/services/importService';
import { detectCollege } from './src/utils/collegeUtils';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const dataDir = path.join(__dirname, 'students_data');
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.xlsx') || f.endsWith('.csv'));

  console.log('\n===================================================');
  console.log(' SEEDING STUDENTS DATA FROM /students_data');
  console.log('===================================================\n');
  console.log(`Found ${files.length} file(s): ${files.join(', ')}\n`);

  for (const filename of files) {
    const filePath = path.join(dataDir, filename);
    const buffer = fs.readFileSync(filePath);
    console.log(`\n---------------------------------------------------`);
    console.log(`[Processing File] ${filename}`);
    console.log(`---------------------------------------------------`);

    // Parse rows using our robust ImportService
    const parsedRows = ImportService.parseFileBuffer(buffer, filename);
    console.log(`✓ Parsed ${parsedRows.length} student rows from ${filename}`);

    if (parsedRows.length > 0) {
      console.log(`Sample Row 1:`, parsedRows[0]);
      if (parsedRows.length > 1) {
        console.log(`Sample Row 2:`, parsedRows[1]);
      }
    }

    // Generate validation preview
    const preview = ImportService.generatePreview(parsedRows);
    console.log(`Validation: ${preview.validRows} valid, ${preview.invalidRows} invalid.`);

    // Confirm and save to database
    const result = await ImportService.confirmImport(preview.previewRows, filename);
    console.log(`Import Result for ${filename}:`, result);
  }

  // Summary counts
  const totalInDb = await prisma.candidate.count();
  const mvsrCount = await prisma.candidate.count({
    where: {
      OR: [
        { college: { contains: 'MVSR', mode: 'insensitive' } },
        { studentId: { startsWith: '2451' } },
      ],
    },
  });
  const matrusriCount = await prisma.candidate.count({
    where: {
      OR: [
        { college: { contains: 'Matrusri', mode: 'insensitive' } },
        { studentId: { startsWith: '1608' } },
      ],
    },
  });

  console.log('\n===================================================');
  console.log(' FINAL DATABASE SYNC SUMMARY');
  console.log('===================================================');
  console.log(`Total Candidates in DB:   ${totalInDb}`);
  console.log(`MVSR Engineering College: ${mvsrCount}`);
  console.log(`Matrusri Eng. College:    ${matrusriCount}`);
  console.log('===================================================\n');
}

main()
  .catch((err) => {
    console.error('Error seeding students:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
