import axiosInstance from './axiosInstance';

export const analyticsApi = {
  getSummary:          ()       => axiosInstance.get('/analytics/summary'),
  getWasteTrends:      (period) => axiosInstance.get('/analytics/waste-trends', { params: { period } }),
  getPickupMetrics:    ()       => axiosInstance.get('/analytics/pickup-metrics'),
  getCategoryBreakdown: ()      => axiosInstance.get('/analytics/category-breakdown'),
};