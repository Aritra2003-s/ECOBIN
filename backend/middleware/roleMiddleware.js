import ApiError from '../utils/ApiError.js';

// Factory function — pass one or more allowed roles.
// Usage: router.get('/admin-only', protect, authorize('admin'), handler)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not authorized for this action.`)
      );
    }
    next();
  };
};

export default authorize;