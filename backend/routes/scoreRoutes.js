import express from 'express';
import * as scoreController from '../controllers/scoreController.js';
import { protect, authorize, requireActiveSubscription } from '../middleware/auth.js';
import { validateScore, validateMongoId } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);
router.use(authorize('subscriber', 'admin'));
router.use(requireActiveSubscription);

router.post('/', validateScore, scoreController.addScore);
router.get('/', scoreController.getScores);
router.put('/:id', [...validateMongoId, ...validateScore], scoreController.updateScore);
router.delete('/:id', validateMongoId, scoreController.deleteScore);

export default router;
