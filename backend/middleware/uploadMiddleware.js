import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ApiError from '../utils/ApiError.js';
import { config } from '../config/env.js';

const UPLOAD_DIR = 'uploads/';

// Ensure the upload directory exists at startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // e.g. report-1721234567890-abc123.jpg
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const isValidMime = allowed.test(file.mimetype);
  const isValidExt = allowed.test(path.extname(file.originalname).toLowerCase());

  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
    files: 5, // Max 5 images per report
  },
});

export default upload;