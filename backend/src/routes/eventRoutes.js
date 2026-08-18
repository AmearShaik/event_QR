const express = require('express');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { listEvents, createEvent, updateEvent, getEventStats } = require('../controllers/eventController');

const router = express.Router();

router.get('/', listEvents);
router.post('/', authenticateAdmin, createEvent);
router.put('/:id', authenticateAdmin, updateEvent);
router.get('/:id/stats', authenticateAdmin, getEventStats);

module.exports = router;
