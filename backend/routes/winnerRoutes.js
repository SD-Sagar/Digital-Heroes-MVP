import express from 'express';
import * as winnerController from '../controllers/winnerController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateMongoId } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

router.get('/my-winnings', authorize('subscriber', 'admin'), winnerController.getMyWinnings);
router.post('/:id/proof', [authorize('subscriber', 'admin'), ...validateMongoId], winnerController.uploadProof);

router.use(authorize('admin'));

router.get('/', winnerController.getAllWinners);
router.put('/:id/verify', validateMongoId, winnerController.verifyWinner);
router.put('/:id/payout', validateMongoId, winnerController.updatePayoutStatus);

export default router;
