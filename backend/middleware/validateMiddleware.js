import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// Reads validation errors set by express-validator chains on each route.
// Call this after your validation chain and before your controller.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new ApiError(400, 'Validation failed.', messages));
  }
  next();
};

export default validate;