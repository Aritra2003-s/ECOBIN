import mongoose from 'mongoose';

// Status transition: pending → approved → assigned → in_progress → completed
//                         └──────────────────────────────────────→ rejected

const statusHistorySchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:      { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pickupRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wasteType: {
      type: String,
      required: [true, 'Waste type is required'],
      enum: ['general', 'recyclable', 'hazardous', 'organic', 'electronic', 'bulky', 'other'],
    },
    quantity: {
      value: { type: Number, required: true, min: 0 },
      unit:  { type: String, enum: ['kg', 'liters', 'bags', 'items'], default: 'bags' },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    pickupAddress: {
      street:  { type: String, required: true, trim: true },
      city:    { type: String, required: true, trim: true },
      state:   { type: String, trim: true },
      zip:     { type: String, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred pickup date is required'],
    },
    preferredTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'morning',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'assigned', 'in_progress', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],

    // Assignment details (filled by admin)
    assignedTo: {
      staff:   { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
      vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
      route:   { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
    },

    scheduledDate:  { type: Date, default: null },
    completedAt:    { type: Date, default: null },
    rejectionReason: { type: String, trim: true },

    // Rating given by user after completion
    feedback: {
      rating:  { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true },
      givenAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
pickupRequestSchema.index({ requestedBy: 1, status: 1 });
pickupRequestSchema.index({ status: 1, preferredDate: 1 });
pickupRequestSchema.index({ 'assignedTo.staff': 1 });
pickupRequestSchema.index({ createdAt: -1 });

// ── Pre-save — auto-append to statusHistory on status change ──────────────────
pickupRequestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);
export default PickupRequest;