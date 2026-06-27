import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    date:        { type: Date, required: true },
    description: { type: String, trim: true },
    cost:        { type: Number },
    nextDueDate: { type: Date },
  },
  { _id: true, timestamps: false }
);

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true, // This automatically creates a UNIQUE index
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['compact_truck', 'large_truck', 'compactor', 'recycling_van', 'hazmat_vehicle'],
      required: true,
    },
    model:         { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    year:          { type: Number },
    capacity: {
      value: { type: Number, required: true },    // e.g. 5000
      unit:  { type: String, default: 'kg' },
    },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'electric', 'cng', 'hybrid'],
      default: 'diesel',
    },
    status: {
      type: String,
      enum: ['available', 'on_route', 'maintenance', 'retired'],
      default: 'available',
    },
    currentMileage: { type: Number, default: 0 },   // In km
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    lastServiced:   { type: Date, default: null },
    nextServiceDue: { type: Date, default: null },
    maintenanceLogs: [maintenanceLogSchema],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    // Add these to make virtuals visible in your API responses
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// REMOVED: vehicleSchema.index({ registrationNumber: 1 }); -> Already indexed via unique: true
vehicleSchema.index({ status: 1, type: 1 });
vehicleSchema.index({ isActive: 1 });

// ── Virtual — overdue for service ─────────────────────────────────────────────
vehicleSchema.virtual('isServiceOverdue').get(function () {
  if (!this.nextServiceDue) return false;
  return new Date() > this.nextServiceDue;
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;