import { Router } from 'express';
import { AdminCandidatesController } from '../controllers/adminCandidatesController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAdminAuth, AdminCandidatesController.listCandidates);
router.get('/:id', requireAdminAuth, AdminCandidatesController.getCandidateById);

export default router;
