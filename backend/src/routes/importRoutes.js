const express = require('express');
const multer = require('multer');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { previewImportFile, confirmImportCandidates } = require('../controllers/importController');

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/preview', authenticateAdmin, upload.single('file'), previewImportFile);
router.post('/confirm', authenticateAdmin, confirmImportCandidates);

module.exports = router;
