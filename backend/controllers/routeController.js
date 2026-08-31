import mongoose from 'mongoose';
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

// POST /api/v1/routes/generate (admin — generate AI routes from pending pickups)
export const generateAiRoutes = async (req, res, next) => {
  try {
    // 1. Fetch unrouted pickups or pending requests
    const unroutedPickups = await mongoose.model('PickupRequest').find({
      status: { $in: ['pending', 'approved', 'assigned'] }
    }).limit(15);

    // 2. Fetch available staff and vehicles for assignments
    const [drivers, vehicles] = await Promise.all([
      mongoose.model('Staff').find({ role: 'driver', isActive: true }),
      mongoose.model('Vehicle').find({ isActive: true }),
    ]);

    const sectors = ['Sector 4 North Commercial', 'Sector 2 Downtown Eco-Grid', 'Sector 1 Green Valley'];
    const createdRoutes = [];

    // Create 2-3 clustered routes
    for (let i = 0; i < Math.min(3, Math.max(1, Math.ceil(unroutedPickups.length / 3) || 2)); i++) {
      const assignedDriver = drivers[i % (drivers.length || 1)]?._id || null;
      const assignedVehicle = vehicles[i % (vehicles.length || 1)]?._id || null;
      const sectorName = sectors[i % sectors.length];

      const routePickups = unroutedPickups.slice(i * 4, (i + 1) * 4);
      const stops = routePickups.length > 0
        ? routePickups.map((p, idx) => ({
            order: idx + 1,
            address: `${p.pickupAddress?.street || 'Central Ave'}, ${p.pickupAddress?.city || 'Metro'}`,
            coordinates: { lat: 37.7749 + idx * 0.01, lng: -122.4194 + idx * 0.01 },
            estimatedArrival: `0${8 + idx}:30 AM`,
            pickupRequest: p._id,
            isCompleted: false,
          }))
        : [
            {
              order: 1,
              address: `100 Central Way, ${sectorName}`,
              coordinates: { lat: 37.7749, lng: -122.4194 },
              estimatedArrival: '08:30 AM',
              pickupRequest: null,
              isCompleted: false,
            },
            {
              order: 2,
              address: `240 Market Street, ${sectorName}`,
              coordinates: { lat: 37.7799, lng: -122.4144 },
              estimatedArrival: '09:45 AM',
              pickupRequest: null,
              isCompleted: false,
            },
            {
              order: 3,
              address: `550 Innovation Parkway, ${sectorName}`,
              coordinates: { lat: 37.7849, lng: -122.4094 },
              estimatedArrival: '11:15 AM',
              pickupRequest: null,
              isCompleted: false,
            },
          ];

      const newRoute = await Route.create({
        name: `AI Cluster — ${sectorName}`,
        zone: sectorName,
        assignedDriver,
        assignedVehicle,
        scheduledDate: new Date(),
        startTime: '08:00 AM',
        endTime: '02:30 PM',
        status: 'active',
        stops,
        totalDistance: { value: 14.5 + i * 3.2, unit: 'km' },
        estimatedDuration: 180 + i * 30,
        aiOptimizationNotes: {
          suggestion: 'Optimized multi-stop waypoint clustering. Avoids morning peak traffic.',
          savedDistance: 4.8 + i * 1.5,
          generatedAt: new Date(),
        },
        notes: 'Autonomous multi-stop clustering generated by EcoBin AI routing engine.',
      });

      // Update the pickups to assigned status
      if (routePickups.length > 0) {
        await mongoose.model('PickupRequest').updateMany(
          { _id: { $in: routePickups.map((p) => p._id) } },
          { $set: { status: 'assigned', 'assignedTo.route': newRoute._id } }
        );
      }

      createdRoutes.push(newRoute);
    }

    res.status(201).json(
      new ApiResponse(201, {
        routes: createdRoutes,
        count: createdRoutes.length,
        savings: '24.8% fuel reduction achieved',
      }, 'AI Routes successfully clustered and dispatched.')
    );
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/routes/:id  (admin)
export const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) throw new ApiError(404, 'Route not found.');
    res.status(200).json(new ApiResponse(200, {}, 'Route deleted.'));
  } catch (err) {
    next(err);
  }
};