import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAdminAuth, EventController.listEvents);
router.post('/', requireAdminAuth, EventController.createEvent);
router.put('/:id', requireAdminAuth, EventController.updateEvent);
router.post('/:id/activate', requireAdminAuth, EventController.activateEvent);
router.post('/:id/deactivate', requireAdminAuth, EventController.deactivateEvent);
router.get('/:id/statistics', requireAdminAuth, EventController.getEventStatistics);

export default router;
