import express from 'express';
import { body } from 'express-validator';
import {
  createPickup, getPickups, getPickupById,
  updatePickupStatus, cancelPickup, submitFeedback,
} from '../controllers/pickupController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/',
  [
    body('wasteType').notEmpty().withMessage('Waste type is required'),
    body('quantity.value').isNumeric().withMessage('Quantity must be a number'),
    body('preferredDate').isISO8601().withMessage('Valid date is required'),
  ],
  validate,
  createPickup
);

router.get('/', getPickups);
router.get('/:id', getPickupById);
router.patch('/:id/status', authorize('admin'), updatePickupStatus);
router.patch('/:id/cancel', cancelPickup);
router.post('/:id/feedback',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  validate,
  submitFeedback
);

export default router;