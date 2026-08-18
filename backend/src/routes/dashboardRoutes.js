const express = require('express');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', authenticateAdmin, getDashboardStats);
router.get('/stats', authenticateAdmin, getDashboardStats);

module.exports = router;
