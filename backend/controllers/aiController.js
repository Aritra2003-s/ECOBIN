import AIInsight from '../models/AIInsight.js';
import WasteReport from '../models/WasteReport.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  classifyWasteFromText,
  classifyWasteFromImage,
  generateRouteOptimization,
  generatePredictiveAnalytics,
} from '../services/aiService.js';

// POST /api/v1/ai/classify-text
export const classifyFromText = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) throw new ApiError(400, 'Text input is required.');

    const result = await classifyWasteFromText(text);

    const insight = await AIInsight.create({
      type: 'waste_classification',
      payload: { ...result, rawInput: text, summary: result.disposalMethod },
      model: result.model,
      generatedBy: req.user._id,
    });

    res.status(200).json(new ApiResponse(200, { insight, classification: result }));
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/ai/classify-image
export const classifyFromImage = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'Image file is required.');

    const result = await classifyWasteFromImage(req.file.path);

    const insight = await AIInsight.create({
      type: 'waste_classification',
      payload: { ...result, rawInput: req.file.path, summary: result.disposalMethod },
      model: result.model,
      generatedBy: req.user._id,
    });

    res.status(200).json(new ApiResponse(200, { insight, classification: result }));
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/ai/optimize-route  (admin)
export const optimizeRoute = async (req, res, next) => {
  try {
    const { stops, routeId } = req.body;
    if (!stops || stops.length < 2) throw new ApiError(400, 'At least 2 stops are required.');

    const result = await generateRouteOptimization(stops);

    const insight = await AIInsight.create({
      type: 'route_optimization',
      relatedTo: { model: 'Route', documentId: routeId || null },
      payload: result,
      model: result.model,
      generatedBy: req.user._id,
    });

    res.status(200).json(new ApiResponse(200, { insight, optimization: result }));
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/ai/predict  (admin)
export const getPredictions = async (req, res, next) => {
  try {
    const result = await generatePredictiveAnalytics();

    const insight = await AIInsight.create({
      type: 'predictive_analytics',
      payload: result,
      model: result.model,
      generatedBy: req.user._id,
    });

    res.status(200).json(new ApiResponse(200, { insight, prediction: result }));
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/ai/insights  (admin — paginated list)
export const getInsights = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [insights, total] = await Promise.all([
      AIInsight.find(filter)
        .populate('generatedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AIInsight.countDocuments(filter),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        insights,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/ai/insights/:id/read  (mark as read)
export const markInsightRead = async (req, res, next) => {
  try {
    const insight = await AIInsight.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!insight) throw new ApiError(404, 'Insight not found.');
    res.status(200).json(new ApiResponse(200, { insight }, 'Marked as read.'));
  } catch (err) {
    next(err);
  }
};