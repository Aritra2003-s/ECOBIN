import mongoose from 'mongoose';

const wasteReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter identifier (User Object ID) is strictly required'],
    },
    title: { 
      type: String, 
      required: [true, 'A descriptive title is required'], 
      trim: true, 
      maxlength: [120, 'Title cannot exceed 120 characters'] 
    },
    description: { 
      type: String, 
      required: [true, 'A description explaining the waste issue is required'], 
      trim: true, 
      maxlength: [1000, 'Description cannot exceed 1000 characters'] 
    },
    category: {
      type: String,
      required: [true, 'Waste category selection is required'],
      enum: {
        values: [
          'general',
          'recyclable',
          'hazardous',
          'organic',
          'electronic',
          'medical',
          'construction',
          'other',
        ],
        message: '{VALUE} is not a valid waste category'
      },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'in_progress', 'resolved', 'rejected'],
        message: '{VALUE} is not a valid report status state'
      },
      default: 'pending',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid priority tier assignment'
      },
      default: 'medium',
    },
    // Aligned subdocument object structure mapping file arrays safely
    images: [
      {
        url: { 
          type: String,
          required: [true, 'Image URL reference link path is required']
        },
        filename: { 
          type: String,
          required: [true, 'File storage object identifier name is required']
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    location: {
      address: { 
        type: String, 
        required: [true, 'Street address or landmark description is required'], 
        trim: true 
      },
      city: { 
        type: String, 
        required: [true, 'City specification is required'], 
        trim: true 
      },
      state: { type: String, trim: true },
      zip: { type: String, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    aiAnalysis: {
      classifiedCategory: { type: String },
      isRecyclable: { type: Boolean },
      disposalMethod: { type: String },
      confidence: { type: Number, min: 0, max: 1 },
      analyzedAt: { type: Date },
    },
    adminNotes: { type: String, trim: true },
    resolvedAt: { type: Date, default: null },
  },
  { 
    timestamps: true 
  }
);

// Add quick scannable compound sorting index optimizations
wasteReportSchema.index({ reportedBy: 1, createdAt: -1 });
wasteReportSchema.index({ status: 1, priority: -1 });

const WasteReport = mongoose.model('WasteReport', wasteReportSchema);
export default WasteReport;