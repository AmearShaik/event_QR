import { Router } from 'express';
import { CandidateController } from '../controllers/candidateController';

const router = Router();

router.post('/login', CandidateController.studentLogin);
router.post('/verify', CandidateController.verifyCandidate);
router.post('/:studentId/register', CandidateController.registerAndGetQr);
router.get('/:studentId/qr', CandidateController.getQr);

export default router;
