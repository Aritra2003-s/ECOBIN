import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { config } from '../config/env.js';

// Verifies the JWT in the Authorization header.
// Attaches the full user document to req.user for downstream use.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided. Please log in.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch fresh user — catches cases where user was deactivated after token issue
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new ApiError(401, 'User no longer exists.');
    if (!user.isActive) throw new ApiError(403, 'Account has been deactivated.');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default protect;