const { parseBufferToRows, processAndValidateRows, confirmAndUpsertCandidates } = require('../services/importService');

async function previewImportFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV or XLSX file uploaded.' });
    }

    const rawRows = parseBufferToRows(req.file.buffer, req.file.originalname);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ error: 'Uploaded file is empty or formatted incorrectly.' });
    }

    const validationResult = processAndValidateRows(rawRows);

    return res.json(validationResult);
  } catch (error) {
    console.error('Import preview error:', error);
    return res.status(500).json({ error: 'Failed to process candidate import preview.' });
  }
}

async function confirmImportCandidates(req, res) {
  try {
    const { previewRows, filename } = req.body;
    const adminUser = req.user;

    if (!previewRows || !Array.isArray(previewRows) || previewRows.length === 0) {
      return res.status(400).json({ error: 'No preview candidate rows provided for confirmation.' });
    }

    const importResult = await confirmAndUpsertCandidates(
      previewRows,
      filename || 'candidate_import.csv',
      adminUser ? adminUser.userId : null
    );

    return res.json({
      message: 'Master candidate records updated successfully.',
      ...importResult,
    });
  } catch (error) {
    console.error('Import confirm error:', error);
    return res.status(500).json({ error: 'Failed to confirm master candidate import.' });
  }
}

module.exports = { previewImportFile, confirmImportCandidates };
