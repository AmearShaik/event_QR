import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAdminAuth, AuthController.me);

export default router;
