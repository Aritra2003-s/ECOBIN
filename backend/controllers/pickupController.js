import PickupRequest from '../models/PickupRequest.js';
import Staff from '../models/Staff.js';
import Vehicle from '../models/Vehicle.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// POST /api/v1/pickups
export const createPickup = async (req, res, next) => {
  try {
    const { wasteType, quantity, description, pickupAddress, preferredDate, preferredTimeSlot } = req.body;

    const pickup = await PickupRequest.create({
      requestedBy: req.user._id,
      wasteType,
      quantity,
      description,
      pickupAddress: typeof pickupAddress === 'string' ? JSON.parse(pickupAddress) : pickupAddress,
      preferredDate,
      preferredTimeSlot,
    });

    res.status(201).json(new ApiResponse(201, { pickup }, 'Pickup request submitted.'));
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/pickups
export const getPickups = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, wasteType } = req.query;
    const filter = {};

    if (req.user.role !== 'admin') filter.requestedBy = req.user._id;
    if (status)    filter.status = status;
    if (wasteType) filter.wasteType = wasteType;

    const skip = (Number(page) - 1) * Number(limit);
    const [pickups, total] = await Promise.all([
      PickupRequest.find(filter)
        .populate('requestedBy', 'name email phone')
        .populate('assignedTo.staff', 'name phone')
        .populate('assignedTo.vehicle', 'registrationNumber type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      PickupRequest.countDocuments(filter),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        pickups,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/pickups/:id
export const getPickupById = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id)
      .populate('requestedBy', 'name email phone address')
      .populate('assignedTo.staff', 'name phone employeeId')
      .populate('assignedTo.vehicle', 'registrationNumber type capacity');

    if (!pickup) throw new ApiError(404, 'Pickup request not found.');

    if (req.user.role !== 'admin' && String(pickup.requestedBy._id) !== String(req.user._id)) {
      throw new ApiError(403, 'Access denied.');
    }

    res.status(200).json(new ApiResponse(200, { pickup }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/pickups/:id/status  (admin — approve, reject, assign)
export const updatePickupStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason, staffId, vehicleId, scheduledDate } = req.body;
    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) throw new ApiError(404, 'Pickup request not found.');

    const validTransitions = {
      pending:     ['approved', 'rejected'],
      approved:    ['assigned', 'rejected'],
      assigned:    ['in_progress', 'rejected'],
      in_progress: ['completed'],
      completed:   [],
      rejected:    [],
      cancelled:   [],
    };

    if (!validTransitions[pickup.status]?.includes(status)) {
      throw new ApiError(400, `Cannot transition from '${pickup.status}' to '${status}'.`);
    }

    pickup.status = status;
    if (rejectionReason) pickup.rejectionReason = rejectionReason;
    if (scheduledDate)   pickup.scheduledDate = scheduledDate;
    if (status === 'completed') pickup.completedAt = new Date();

    // Assign staff and vehicle when moving to 'assigned'
    if (status === 'assigned') {
      if (!staffId || !vehicleId) throw new ApiError(400, 'Staff and vehicle are required for assignment.');

      const [staff, vehicle] = await Promise.all([
        Staff.findById(staffId),
        Vehicle.findById(vehicleId),
      ]);
      if (!staff)   throw new ApiError(404, 'Staff member not found.');
      if (!vehicle) throw new ApiError(404, 'Vehicle not found.');

      pickup.assignedTo.staff   = staffId;
      pickup.assignedTo.vehicle = vehicleId;

      // Update availability
      staff.availability   = 'on_route';
      vehicle.status       = 'on_route';
      await Promise.all([staff.save(), vehicle.save()]);
    }

    // Free staff + vehicle when completed
    if (status === 'completed' && pickup.assignedTo.staff) {
      await Promise.all([
        Staff.findByIdAndUpdate(pickup.assignedTo.staff,   { availability: 'available' }),
        Vehicle.findByIdAndUpdate(pickup.assignedTo.vehicle, { status: 'available' }),
        Staff.findByIdAndUpdate(pickup.assignedTo.staff,
          { $inc: { totalPickupsCompleted: 1 } }
        ),
      ]);
    }

    await pickup.save();
    res.status(200).json(new ApiResponse(200, { pickup }, `Pickup ${status}.`));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/pickups/:id/cancel  (user cancels their own pending request)
export const cancelPickup = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) throw new ApiError(404, 'Pickup request not found.');
    if (String(pickup.requestedBy) !== String(req.user._id)) throw new ApiError(403, 'Access denied.');
    if (!['pending', 'approved'].includes(pickup.status)) {
      throw new ApiError(400, 'Only pending or approved requests can be cancelled.');
    }

    pickup.status = 'cancelled';
    await pickup.save();

    res.status(200).json(new ApiResponse(200, { pickup }, 'Pickup request cancelled.'));
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/pickups/:id/feedback  (user submits rating after completion)
export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) throw new ApiError(404, 'Pickup request not found.');
    if (String(pickup.requestedBy) !== String(req.user._id)) throw new ApiError(403, 'Access denied.');
    if (pickup.status !== 'completed') throw new ApiError(400, 'Can only rate completed pickups.');
    if (pickup.feedback?.rating) throw new ApiError(409, 'Feedback already submitted.');

    pickup.feedback = { rating, comment, givenAt: new Date() };
    await pickup.save();

    res.status(200).json(new ApiResponse(200, { pickup }, 'Feedback submitted. Thank you!'));
  } catch (err) {
    next(err);
  }
};