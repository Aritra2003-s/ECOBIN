import express from 'express';
import { body } from 'express-validator';
import {
  classifyFromText, classifyFromImage,
  optimizeRoute, getPredictions,
  getInsights, markInsightRead,
} from '../controllers/aiController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

// Available to all authenticated users
router.post('/classify-text',
  [body('text').trim().notEmpty().withMessage('Text input is required')],
  validate,
  classifyFromText
);

router.post('/classify-image',
  upload.single('image'),
  classifyFromImage
);

// Admin-only
router.post('/optimize-route',
  authorize('admin'),
  [body('stops').isArray({ min: 2 }).withMessage('At least 2 stops required')],
  validate,
  optimizeRoute
);

router.get('/predict', authorize('admin'), getPredictions);
router.get('/insights', authorize('admin'), getInsights);
router.patch('/insights/:id/read', authorize('admin'), markInsightRead);

export default router;