import express from 'express';
import {
  createRoute, getRoutes, getRouteById,
  updateRoute, completeStop, deleteRoute,
} from '../controllers/routeController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// 1. Authenticate all routes globally
router.use(protect);

// 2. Open up read-only access and stop completions to Drivers/Staff
// If drivers need to check their assigned routes, they must be allowed to use GET and PATCH stops.
router.get('/', getRoutes);
router.get('/:id', getRouteById);
router.patch('/:id/stop/:stopId/complete', completeStop);

// 3. Restrict administrative write actions strictly to 'admin' users
router.post('/', authorize('admin'), createRoute);
router.patch('/:id', authorize('admin'), updateRoute);
router.delete('/:id', authorize('admin'), deleteRoute);

// Error Handling Middleware local to this router for fast debugging
router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Database Validation Failed',
      details: err.message
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid Resource ID Format: ${err.value}`,
    });
  }
  next(err);
});

export default router;