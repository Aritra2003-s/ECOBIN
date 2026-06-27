import express from 'express';
import {
  getSummary, getWasteTrendsData, getPickupMetricsData, getCategoryBreakdown,
} from '../controllers/analyticsController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/summary', getSummary);
router.get('/waste-trends', getWasteTrendsData);
router.get('/pickup-metrics', getPickupMetricsData);
router.get('/category-breakdown', getCategoryBreakdown);

export default router;