import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAdminAuth, DashboardController.getStats);
router.get('/stats', requireAdminAuth, DashboardController.getStats);

export default router;
