const express = require('express');
const { loginAdmin, getMe } = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', authenticateAdmin, getMe);

module.exports = router;
