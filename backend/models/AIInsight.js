import mongoose from 'mongoose';

// Stores AI-generated analysis results — waste classifications,
// route optimizations, and predictive analytics snapshots.
// Admin views these on the AI Insights dashboard.

const aiInsightSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'waste_classification',   // From scanner — per report or pickup
        'disposal_recommendation',
        'route_optimization',
        'predictive_analytics',
        'anomaly_detection',
      ],
    },
    // The resource this insight relates to (polymorphic ref)
    relatedTo: {
      model: {
        type: String,
        enum: ['WasteReport', 'PickupRequest', 'Route', 'User', null],
        default: null,
      },
      documentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },
    // Free-form payload — shape differs by type
    payload: {
      // waste_classification
      classifiedCategory: { type: String },
      isRecyclable:        { type: Boolean },
      confidence:          { type: Number, min: 0, max: 1 },
      disposalMethod:      { type: String },
      tags:                [{ type: String }],

      // route_optimization
      originalDistance:   { type: Number },
      optimizedDistance:  { type: Number },
      savedDistance:      { type: Number },
      routeSuggestion:    { type: String },

      // predictive_analytics
      forecastPeriod:     { type: String },   // e.g. "next_7_days"
      predictedVolume:    { type: Number },
      trend:              { type: String, enum: ['increasing', 'decreasing', 'stable'] },
      recommendedActions: [{ type: String }],

      // anomaly_detection
      anomalyDescription: { type: String },
      severity:           { type: String, enum: ['low', 'medium', 'high'] },

      // Shared
      summary:  { type: String },
      rawInput: { type: String },   // Input text or image path that triggered analysis
    },
    model: {
      type: String,
      default: 'mock',   // 'gpt-4o', 'mock', etc.
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,    // The user who triggered the scan; null = system-generated
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
aiInsightSchema.index({ type: 1, createdAt: -1 });
aiInsightSchema.index({ isRead: 1 });
aiInsightSchema.index({ 'relatedTo.documentId': 1 });
aiInsightSchema.index({ generatedBy: 1 });

const AIInsight = mongoose.model('AIInsight', aiInsightSchema);
export default AIInsight;