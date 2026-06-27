import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// GET /api/v1/users/profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(new ApiResponse(200, { user }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'address', 'notifications'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file) {
      updates.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(new ApiResponse(200, { user }, 'Profile updated.'));
  } catch (err) {
    next(err);
  }
};

// ── Admin-only routes ─────────────────────────────────────────────────────────

// GET /api/v1/users  (admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, isActive, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        users,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/users/:id  (admin)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found.');
    res.status(200).json(new ApiResponse(200, { user }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/users/:id/status  (admin — activate/deactivate)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found.');
    if (user.role === 'admin') throw new ApiError(403, 'Cannot deactivate an admin account.');

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    const msg = user.isActive ? 'User activated.' : 'User deactivated.';
    res.status(200).json(new ApiResponse(200, { user }, msg));
  } catch (err) {
    next(err);
  }
};