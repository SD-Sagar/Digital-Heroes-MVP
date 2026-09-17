import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('subscriber', 'admin'));

router.post('/', subscriptionController.createSubscription);
router.get('/my-subscription', subscriptionController.getMySubscription);
router.put('/cancel', subscriptionController.cancelSubscription);

export default router;
