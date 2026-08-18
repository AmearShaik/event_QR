import { Router } from 'express';
import multer from 'multer';
import { ImportController } from '../controllers/importController';
import { requireAdminAuth } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post('/preview', requireAdminAuth, upload.single('file'), ImportController.preview);
router.post('/confirm', requireAdminAuth, ImportController.confirm);
router.get('/history', requireAdminAuth, ImportController.history);

export default router;
