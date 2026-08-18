const express = require('express');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { listCandidates, getCandidateById } = require('../controllers/adminCandidatesController');

const router = express.Router();

router.get('/', authenticateAdmin, listCandidates);
router.get('/:id', authenticateAdmin, getCandidateById);

module.exports = router;
