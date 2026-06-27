import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { config } from '../config/env.js';

const signToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

// POST /api/v1/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, 'An account with this email already exists.');

    const user = await User.create({ name, email, password, phone });
    const token = signToken(user._id);

    res.status(201).json(
      new ApiResponse(201, { token, user: sanitize(user) }, 'Account created successfully.')
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new ApiError(401, 'Invalid email or password.');
    if (!user.isActive) throw new ApiError(403, 'Account has been deactivated. Contact support.');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new ApiError(401, 'Invalid email or password.');

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.status(200).json(
      new ApiResponse(200, { token, user: sanitize(user) }, 'Logged in successfully.')
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(new ApiResponse(200, { user: sanitize(user) }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ApiError(401, 'Current password is incorrect.');

    user.password = newPassword;
    await user.save();

    res.status(200).json(new ApiResponse(200, null, 'Password updated successfully.'));
  } catch (err) {
    next(err);
  }
};

// Strip sensitive fields before sending user object to client
const sanitize = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};