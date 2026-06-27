import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/env.js';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';

// Route imports (we'll fill these in Phase 2)
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import pickupRoutes from './routes/pickupRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging (skip in test environments)
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────

const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/pickups`, pickupRoutes);
app.use(`${API}/routes`, routeRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/ai`, aiRoutes);

// Health check endpoint
app.get(`${API}/health`, (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Error Handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port} [${config.nodeEnv}]`);
  });
};

start();

export default app;