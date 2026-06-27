import mongoose from 'mongoose';

// A Route represents a planned collection path with ordered stops.
// Admin creates routes; drivers follow them.

const stopSchema = new mongoose.Schema(
  {
    order: { 
      type: Number, 
      required: [true, 'Stop sequence order position is required'] 
    }, // Sequence position
    address: { 
      type: String, 
      required: [true, 'Stop address location is required'], 
      trim: true 
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    estimatedArrival: { type: String },          // e.g. "09:30 AM"
    pickupRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupRequest',
      // If frontend passes an empty string or invalid value, transform it to null gracefully
      set: v => v === '' ? null : v,
      default: null,
    },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: true }
);

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
    },
    zone: {
      type: String,
      required: [true, 'Zone is required'],
      trim: true,
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      // Pre-processor setter: Converts empty form options ("") automatically to null
      set: v => v === '' || v === 'Unassigned' ? null : v,
      default: null,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      // Pre-processor setter: Prevents Object ID Casting crashes from UI dropdown states
      set: v => v === '' || v === 'Unassigned' ? null : v,
      default: null,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    startTime: { type: String },   // "07:00 AM"
    endTime:   { type: String },   // "03:00 PM" (estimated)
    status: {
      type: String,
      enum: {
        values: ['planned', 'active', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid route status'
      },
      lowercase: true, // Automatically converts "Planned" or "Active" to lowercase before saving
      trim: true,
      default: 'planned',
    },
    stops: [stopSchema],
    totalDistance: {
      value: { type: Number, default: 0 },   // In kilometers
      unit:  { type: String, default: 'km' },
    },
    estimatedDuration: { type: Number, default: 0 },  // In minutes

    // AI-generated optimization notes for this route
    aiOptimizationNotes: {
      suggestion: { type: String },
      savedDistance: { type: Number },
      generatedAt: { type: Date },
    },

    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    // Ensure virtuals are included when converting documents to JSON or Objects
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
routeSchema.index({ scheduledDate: 1, status: 1 });
routeSchema.index({ assignedDriver: 1 });
routeSchema.index({ zone: 1 });

// ── Virtual — stop count ──────────────────────────────────────────────────────
routeSchema.virtual('stopCount').get(function () {
  return this.stops ? this.stops.length : 0;
});

const Route = mongoose.model('Route', routeSchema);
export default Route;