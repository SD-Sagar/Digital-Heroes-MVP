import express from 'express';
import * as drawController from '../controllers/drawController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateDraw, validateMongoId } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

router.get('/', drawController.getDraws);
router.get('/my-participations', authorize('subscriber', 'admin'), drawController.getMyParticipations);
router.get('/:id', validateMongoId, drawController.getDraw);

router.use(authorize('admin'));

router.post('/', validateDraw, drawController.createDraw);
router.post('/:id/simulate', validateMongoId, drawController.simulateDraw);
router.post('/:id/publish', validateMongoId, drawController.publishDraw);
router.delete('/:id', validateMongoId, drawController.deleteDraw);
router.get('/admin/prize-pool', drawController.calculatePrizePool);

export default router;
