import express from 'express';
import * as charityController from '../controllers/charityController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateCharitySelection, validateCharity, validateMongoId } from '../middleware/validators.js';

const router = express.Router();

router.get('/', charityController.getCharities);
router.get('/:id', validateMongoId, charityController.getCharity);

router.use(protect);

router.post('/select', [authorize('subscriber', 'admin'), ...validateCharitySelection], charityController.selectCharity);
router.get('/my/selection', authorize('subscriber', 'admin'), charityController.getMySelection);

router.post('/', [authorize('admin'), ...validateCharity], charityController.createCharity);
router.put('/:id', [authorize('admin'), ...validateMongoId, ...validateCharity], charityController.updateCharity);
router.delete('/:id', [authorize('admin'), ...validateMongoId], charityController.deleteCharity);

export default router;
