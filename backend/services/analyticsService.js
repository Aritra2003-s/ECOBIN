import WasteReport from '../models/WasteReport.js';
import PickupRequest from '../models/PickupRequest.js';
import User from '../models/User.js';

export const getAnalyticsSummary = async () => {
  const [
    totalUsers,
    activeUsers,
    totalReports,
    pendingReports,
    totalPickups,
    completedPickups,
    pendingPickups,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', isActive: true }),
    WasteReport.countDocuments(),
    WasteReport.countDocuments({ status: 'pending' }),
    PickupRequest.countDocuments(),
    PickupRequest.countDocuments({ status: 'completed' }),
    PickupRequest.countDocuments({ status: 'pending' }),
  ]);

  const completionRate = totalPickups > 0
    ? ((completedPickups / totalPickups) * 100).toFixed(1)
    : 0;

  return {
    users:   { total: totalUsers, active: activeUsers },
    reports: { total: totalReports, pending: pendingReports },
    pickups: { total: totalPickups, completed: completedPickups, pending: pendingPickups, completionRate },
  };
};

export const getWasteTrends = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const trends = await WasteReport.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          category: '$category',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  return { trends, period: days };
};

export const getPickupMetrics = async () => {
  const statusBreakdown = await PickupRequest.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);

  const wasteTypeBreakdown = await PickupRequest.aggregate([
    { $group: { _id: '$wasteType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { wasteType: '$_id', count: 1, _id: 0 } },
  ]);

  // Average rating from completed pickups with feedback
  const ratingResult = await PickupRequest.aggregate([
    { $match: { 'feedback.rating': { $exists: true } } },
    { $group: { _id: null, avgRating: { $avg: '$feedback.rating' }, count: { $sum: 1 } } },
  ]);

  const avgRating = ratingResult[0]?.avgRating?.toFixed(1) || 'N/A';

  return { statusBreakdown, wasteTypeBreakdown, avgRating };
};