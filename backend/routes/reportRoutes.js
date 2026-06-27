import express from 'express';
import { body } from 'express-validator';
import {
  createReport, getReports, getReportById, updateReport, deleteReport,
} from '../controllers/reportController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

// POST /api/v1/reports
router.post('/',
  // 1. Run the upload handler FIRST to parse multi-part binary data and assemble req.body fields
  upload.array('images', 5),
  // 2. Resilient checks parsing multi-part text strings smoothly
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .bail(),
      
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .bail(),
      
    body('category')
      .trim()
      .notEmpty().withMessage('Category selection is required')
      .toLowerCase() // FIXED: Normalizes mixed casing (e.g. "Recyclable" -> "recyclable") to pass backend validations
      .isIn(['general', 'recyclable', 'hazardous', 'organic', 'electronic', 'medical', 'construction', 'other'])
      .withMessage('Invalid waste category selection')
      .bail(),

    body('priority')
      .trim()
      .notEmpty().withMessage('Priority setting is required')
      .toLowerCase() // Normalizes priority inputs to lowercase as well
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority selection tier')
      .bail(),

    body('location')
      .notEmpty().withMessage('Location object data is required')
  ],
  // 3. Evaluates express-validator errors before hitting the handler
  validate,
  // 4. Controller processing initialization block
  createReport
);

router.get('/', getReports);
router.get('/:id', getReportById);
router.patch('/:id', authorize('admin'), updateReport);
router.delete('/:id', authorize('admin'), deleteReport);

export default router;