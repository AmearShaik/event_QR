"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportController = void 0;
const client_1 = require("@prisma/client");
const importService_1 = require("../services/importService");
const prisma = new client_1.PrismaClient();
class ImportController {
    static async preview(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Please upload a CSV or XLSX file.' });
            }
            const parsedRows = importService_1.ImportService.parseFileBuffer(req.file.buffer, req.file.originalname);
            if (parsedRows.length === 0) {
                return res.status(400).json({ error: 'Uploaded file is empty or could not be parsed.' });
            }
            const previewData = importService_1.ImportService.generatePreview(parsedRows);
            return res.json(previewData);
        }
        catch (err) {
            return res.status(500).json({ error: err.message || 'Error processing import preview.' });
        }
    }
    static async confirm(req, res) {
        try {
            const { previewRows, filename } = req.body;
            if (!previewRows || !Array.isArray(previewRows)) {
                return res.status(400).json({ error: 'Invalid preview data for confirmation.' });
            }
            const confirmResult = await importService_1.ImportService.confirmImport(previewRows, filename || 'import.csv');
            return res.json(confirmResult);
        }
        catch (err) {
            return res.status(500).json({ error: err.message || 'Error confirming candidate import.' });
        }
    }
    static async history(req, res) {
        try {
            const logs = await prisma.importLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            return res.json({ logs });
        }
        catch (err) {
            return res.status(500).json({ error: err.message || 'Error fetching import history.' });
        }
    }
}
exports.ImportController = ImportController;
