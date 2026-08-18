import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();

// Scan endpoint (protected by Admin auth as attendance scanner is an Admin tool)
router.post('/scan', requireAdminAuth, AttendanceController.scan);

// Attendance records list
router.get('/', requireAdminAuth, AttendanceController.listAttendance);
router.get('/logs', requireAdminAuth, AttendanceController.listAttendance);
router.get('/export-csv', requireAdminAuth, AttendanceController.exportCSV);

export default router;
