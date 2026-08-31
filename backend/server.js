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

// Flexible CORS for Vercel production, preview branches, and local dev
const allowedOrigins = config.clientUrl
  ? config.clientUrl.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, health checks, curl, or mobile app requests
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.trim().replace(/\/$/, '');

    // Allow all vercel.app domains, localhost ports, and configured URLs
    const isVercel = cleanOrigin.endsWith('.vercel.app') || cleanOrigin.includes('vercel.app');
    const isLocal = cleanOrigin.startsWith('http://localhost') || cleanOrigin.startsWith('http://127.0.0.1');
    const isExplicit = allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes('*');

    if (isVercel || isLocal || isExplicit) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

// Welcome & System Status Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'EcoBin Waste Management System API',
    status: 'online',
    environment: config.nodeEnv,
    version: 'v1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api/v1/health`,
    endpoints: {
      health: `${API}/health`,
      auth: `${API}/auth`,
      users: `${API}/users`,
      reports: `${API}/reports`,
      pickups: `${API}/pickups`,
      routes: `${API}/routes`,
      analytics: `${API}/analytics`,
      ai: `${API}/ai`,
    },
    timestamp: new Date().toISOString(),
  });
});

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