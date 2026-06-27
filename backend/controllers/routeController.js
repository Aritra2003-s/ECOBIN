import Route from '../models/Route.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// Helper function to clean up incoming payloads from the frontend
const sanitizeRoutePayload = (body) => {
  const sanitized = { ...body };

  // If assignedDriver or assignedVehicle are empty strings (""), replace them with null
  // This prevents Mongoose from failing to cast "" into an ObjectId
  if (sanitized.assignedDriver === "" || sanitized.assignedDriver === "Unassigned") {
    sanitized.assignedDriver = null;
  }
  if (sanitized.assignedVehicle === "") {
    sanitized.assignedVehicle = null;
  }

  // Ensure status is lowercase to match enum values strictly if sent from frontend
  if (sanitized.status) {
    sanitized.status = sanitized.status.toLowerCase();
  }

  return sanitized;
};

// POST /api/v1/routes  (admin)
export const createRoute = async (req, res, next) => {
  try {
    // Sanitize payload before passing it to Mongoose to safeguard against casting errors
    const cleanedData = sanitizeRoutePayload(req.body);
    
    const route = await Route.create(cleanedData);
    res.status(201).json(new ApiResponse(201, { route }, 'Route created.'));
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/routes
export const getRoutes = async (req, res, next) => {
  try {
    const { status, zone, date } = req.query;
    const filter = {};
    if (status) filter.status = status.toLowerCase();
    if (zone)   filter.zone = { $regex: zone, $options: 'i' };
    if (date) {
      const d = new Date(date);
      filter.scheduledDate = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const routes = await Route.find(filter)
      .populate('assignedDriver', 'name phone')
      .populate('assignedVehicle', 'registrationNumber type')
      .sort({ scheduledDate: 1 });

    res.status(200).json(new ApiResponse(200, { routes, total: routes.length }));
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/routes/:id
export const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('assignedDriver', 'name phone employeeId')
      .populate('assignedVehicle', 'registrationNumber type capacity')
      .populate('stops.pickupRequest');

    if (!route) throw new ApiError(404, 'Route not found.');
    res.status(200).json(new ApiResponse(200, { route }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/routes/:id  (admin)
export const updateRoute = async (req, res, next) => {
  try {
    const cleanedData = sanitizeRoutePayload(req.body);

    const route = await Route.findByIdAndUpdate(req.params.id, cleanedData, {
      new: true,
      runValidators: true,
    });
    if (!route) throw new ApiError(404, 'Route not found.');
    res.status(200).json(new ApiResponse(200, { route }, 'Route updated.'));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/routes/:id/stop/:stopId/complete  (mark individual stop done)
export const completeStop = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) throw new ApiError(404, 'Route not found.');

    const stop = route.stops.id(req.params.stopId);
    if (!stop) throw new ApiError(404, 'Stop not found.');

    stop.isCompleted = true;

    // Auto-complete route if all stops are done
    const allDone = route.stops.every((s) => s.isCompleted);
    if (allDone) route.status = 'completed';

    await route.save();
    res.status(200).json(new ApiResponse(200, { route }, 'Stop marked complete.'));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/routes/:id  (admin)
export const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) throw new ApiError(404, 'Route not found.');
    res.status(200).json(new ApiResponse(200, null, 'Route deleted.'));
  } catch (err) {
    next(err);
  }
};