const express = require('express');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { scanQrCodeToken, getAttendanceLogs, exportAttendanceCSV } = require('../controllers/attendanceController');

const router = express.Router();

router.post('/scan', scanQrCodeToken);
router.get('/logs', authenticateAdmin, getAttendanceLogs);
router.get('/export-csv', authenticateAdmin, exportAttendanceCSV);

module.exports = router;
