import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { ImportService, ParsedRowData } from './src/services/importService';

const prisma = new PrismaClient();

const FILE_CONFIG: { file: string }[] = [
  { file: 'Graduation Day -2026  FEE STATUS 20-08-2026 - Group.xlsx' },
];

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
      const parsedRows = ImportService.parseFileBuffer(buffer, config.file);

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
