import mongoose from 'mongoose';

// Staff represents drivers and collection workers managed by admin.
// Not the same as User — staff don't log into the citizen portal.

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Staff name is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true, // This automatically creates a unique index
      uppercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['driver', 'collector', 'supervisor'],
      required: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,   // Required for drivers
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    availability: {
      type: String,
      enum: ['available', 'on_route', 'off_duty', 'on_leave'],
      default: 'available',
    },
    shiftTiming: {
      start: { type: String },   // "06:00 AM"
      end:   { type: String },   // "02:00 PM"
    },
    joiningDate: {
      type: Date,
      default: Date.now, // Added a default joining date
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    performanceRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalPickupsCompleted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// REMOVED: staffSchema.index({ employeeId: 1 }); -> Already handled by unique: true

// Keep these as they are "compound" or "filter" indexes which are helpful for performance
staffSchema.index({ availability: 1, role: 1 });
staffSchema.index({ isActive: 1 });

const Staff = mongoose.model('Staff', staffSchema);
export default Staff;