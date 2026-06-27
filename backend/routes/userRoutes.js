import express from 'express';
import {
  getProfile, updateProfile,
  getAllUsers, getUserById, toggleUserStatus,
} from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect); // All user routes require auth

router.get('/profile', getProfile);
router.patch('/profile', upload.single('avatar'), updateProfile);

// Admin-only
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);
router.patch('/:id/status', authorize('admin'), toggleUserStatus);

export default router;