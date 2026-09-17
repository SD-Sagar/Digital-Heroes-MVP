import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateMongoId } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.get('/users/:id', validateMongoId, adminController.getUser);
router.put('/users/:id', validateMongoId, adminController.updateUser);
router.put('/users/:userId/scores/:scoreId', adminController.updateUserScore);

export default router;
