import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ImportService } from '../services/importService';

const prisma = new PrismaClient();

export class ImportController {
  static async preview(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please upload a CSV or XLSX file.' });
      }

      const parsedRows = ImportService.parseFileBuffer(req.file.buffer, req.file.originalname);
      if (parsedRows.length === 0) {
        return res.status(400).json({ error: 'Uploaded file is empty or could not be parsed.' });
      }

      const previewData = ImportService.generatePreview(parsedRows);
      return res.json(previewData);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error processing import preview.' });
    }
  }

  static async confirm(req: Request, res: Response) {
    try {
      const { previewRows, filename } = req.body;
      if (!previewRows || !Array.isArray(previewRows)) {
        return res.status(400).json({ error: 'Invalid preview data for confirmation.' });
      }

      const confirmResult = await ImportService.confirmImport(previewRows, filename || 'import.csv');
      return res.json(confirmResult);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error confirming candidate import.' });
    }
  }

  static async history(req: Request, res: Response) {
    try {
      const logs = await prisma.importLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      return res.json({ logs });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching import history.' });
    }
  }
}
