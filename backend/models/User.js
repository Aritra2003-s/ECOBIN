import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // This automatically creates a UNIQUE index
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number'],
    },
    address: {
      street: { type: String, trim: true },
      city:   { type: String, trim: true },
      state:  { type: String, trim: true },
      zip:    { type: String, trim: true },
    },
    avatar: {
      type: String,         // Relative path to uploaded file
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms:   { type: Boolean, default: false },
    },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt automatically
    toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// REMOVED: userSchema.index({ email: 1 }); -> Handled by unique: true
userSchema.index({ role: 1, isActive: 1 });

// ── Pre-save Hook — hash password only when it has been modified ──────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Instance Method — password comparison ─────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  // candidatePassword is plain text, this.password is hashed
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Virtual — full address string ─────────────────────────────────────────────
userSchema.virtual('fullAddress').get(function () {
  if (!this.address) return '';
  const { street, city, state, zip } = this.address;
  return [street, city, state, zip].filter(Boolean).join(', ');
});

const User = mongoose.model('User', userSchema);
export default User;