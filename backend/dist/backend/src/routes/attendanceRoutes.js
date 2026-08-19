"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Scan endpoint (protected by Admin auth as attendance scanner is an Admin tool)
router.post('/scan', authMiddleware_1.requireAdminAuth, attendanceController_1.AttendanceController.scan);
// Attendance records list
router.get('/', authMiddleware_1.requireAdminAuth, attendanceController_1.AttendanceController.listAttendance);
router.get('/logs', authMiddleware_1.requireAdminAuth, attendanceController_1.AttendanceController.listAttendance);
router.get('/export-csv', authMiddleware_1.requireAdminAuth, attendanceController_1.AttendanceController.exportCSV);
exports.default = router;
