import WasteReport from '../models/WasteReport.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// POST /api/v1/reports
export const createReport = async (req, res, next) => {
  try {
    const { title, description, category, priority, location } = req.body;

    // 1. Mandatory base validations
    if (!title || !description || !category || !priority || !location) {
      throw new ApiError(400, 'All required reporting fields must be completed.');
    }

    // 2. Safe parsing of stringified FormData objects
    let parsedLocation;
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (parseErr) {
      throw new ApiError(400, 'Malformed JSON payload provided inside the location schema path.');
    }

    if (!parsedLocation.address || !parsedLocation.city) {
      throw new ApiError(400, 'Location address and city are mandatory database parameters.');
    }

    // 3. Clean mapping of files array to match the structural document schema design
    const images = (req.files || []).map((file) => ({
      url: file.path || '',
      filename: file.filename || file.originalname || 'uploaded_image',
    }));

    // 4. Build database entry document cleanly
    const report = await WasteReport.create({
      reportedBy: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      location: {
        address: parsedLocation.address.trim(),
        city: parsedLocation.city.trim(),
        state: parsedLocation.state ? parsedLocation.state.trim() : '',
        zip: parsedLocation.zip ? parsedLocation.zip.trim() : '',
      },
      images,
    });

    res.status(201).json(new ApiResponse(201, { report }, 'Waste report submitted successfully.'));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fieldErrors = Object.values(err.errors).map(e => e.message).join(', ');
      return next(new ApiError(400, `Validation Failure: ${fieldErrors}`));
    }
    next(err);
  }
};

// GET /api/v1/reports (user sees own; admin sees all)
export const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;
    const filter = {};

    if (req.user.role !== 'admin') filter.reportedBy = req.user._id;
    if (status)   filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      WasteReport.find(filter)
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WasteReport.countDocuments(filter),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        reports,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/reports/:id
export const getReportById = async (req, res, next) => {
  try {
    const report = await WasteReport.findById(req.params.id).populate('reportedBy', 'name email');
    if (!report) throw new ApiError(404, 'Report not found.');

    if (req.user.role !== 'admin' && String(report.reportedBy._id) !== String(req.user._id)) {
      throw new ApiError(403, 'Access denied.');
    }

    res.status(200).json(new ApiResponse(200, { report }));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/reports/:id (admin — update status, add notes)
export const updateReport = async (req, res, next) => {
  try {
    const allowed = ['status', 'priority', 'adminNotes'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (updates.status === 'resolved') updates.resolvedAt = new Date();

    const report = await WasteReport.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!report) throw new ApiError(404, 'Report not found.');

    res.status(200).json(new ApiResponse(200, { report }, 'Report updated successfully.'));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fieldErrors = Object.values(err.errors).map(e => e.message).join(', ');
      return next(new ApiError(400, `Validation Failure: ${fieldErrors}`));
    }
    next(err);
  }
};

// DELETE /api/v1/reports/:id (admin only)
export const deleteReport = async (req, res, next) => {
  try {
    const report = await WasteReport.findByIdAndDelete(req.params.id);
    if (!report) throw new ApiError(404, 'Report not found.');
    
    res.status(200).json(new ApiResponse(200, null, 'Report deleted successfully.'));
  } catch (err) {
    next(err);
  }
};