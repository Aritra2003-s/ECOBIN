import WasteReport from '../models/WasteReport.js';
import PickupRequest from '../models/PickupRequest.js';
import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
import { getAnalyticsSummary, getWasteTrends, getPickupMetrics } from '../services/analyticsService.js';

// GET /api/v1/analytics/summary  (admin KPI cards)
export const getSummary = async (req, res, next) => {
  try {
    const summary = await getAnalyticsSummary();
    res.status(200).json(new ApiResponse(200, summary));
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/analytics/waste-trends?period=30  (chart data)
export const getWasteTrendsData = async (req, res, next) => {
  try {
    const days = parseInt(req.query.period || '30', 10);
    const trends = await getWasteTrends(days);
    res.status(200).json(new ApiResponse(200, trends));
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/analytics/pickup-metrics
export const getPickupMetricsData = async (req, res, next) => {
  try {
    const metrics = await getPickupMetrics();
    res.status(200).json(new ApiResponse(200, metrics));
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/analytics/category-breakdown
export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const breakdown = await WasteReport.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);
    res.status(200).json(new ApiResponse(200, { breakdown }));
  } catch (err) {
    next(err);
  }
};