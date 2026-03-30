import express from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './utils/logger.js';
import { authRoutes } from './routes/auth.routes.js';
import { metricsRoutes } from './routes/metrics.routes.js';
import { k8sRoutes } from './routes/k8s.routes.js';
import { authMiddleware } from './middleware/auth.js';
import { startMetricsCollection, getLatestMetrics, getMetricsHistory } from './services/linux-metrics.service.js';
import { getPodsStatus, isK8sAvailable } from './services/k8s.service.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// ──────────────────────────────────────────────
// Security Middlewares
// ──────────────────────────────────────────────

// Helmet - Security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS - Restricted to frontend origin only
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));

// Rate limiting - General
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  keyGenerator: (req) => req.ip,
});
app.use(generalLimiter);

// HPP - HTTP Parameter Pollution protection
app.use(hpp());

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Request logging (sanitized)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 100),
  });
  next();
});

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (public - with own rate limiting)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/metrics', authMiddleware, metricsRoutes);
app.use('/api/k8s', authMiddleware, k8sRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// ──────────────────────────────────────────────
// WebSocket (Socket.IO) with JWT auth
// ──────────────────────────────────────────────

const io = new SocketIOServer(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB max
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Invalid or expired token'));
  }
});

// Connected clients tracking
const connectedClients = new Set();

io.on('connection', (socket) => {
  connectedClients.add(socket.id);
  logger.info(`Client connected: ${socket.id} (${connectedClients.size} total)`);

  // Send initial data immediately
  socket.emit('metrics:update', getLatestMetrics());

  socket.on('disconnect', () => {
    connectedClients.delete(socket.id);
    logger.info(`Client disconnected: ${socket.id} (${connectedClients.size} total)`);
  });

  socket.on('error', (err) => {
    logger.error(`Socket error for ${socket.id}:`, { error: err.message });
  });
});

// ──────────────────────────────────────────────
// Periodic metrics broadcast
// ──────────────────────────────────────────────

// Start collecting system metrics
startMetricsCollection();

// Broadcast metrics every 5 seconds
setInterval(async () => {
  if (connectedClients.size === 0) return;

  const metrics = getLatestMetrics();
  io.emit('metrics:update', metrics);

  // K8S pod status broadcast
  try {
    if (await isK8sAvailable()) {
      const pods = await getPodsStatus();
      io.emit('k8s:pods', pods);
    }
  } catch (err) {
    // K8S might not be available, that's ok
  }
}, 5000);

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────

server.listen(PORT, () => {
  logger.info(`🛡️  Sentinel Monitor Server running on port ${PORT}`);
  logger.info(`🔒 Security: Helmet, CORS, Rate Limiting, HPP enabled`);
  logger.info(`📊 Metrics collection started (5s interval)`);
});

export { io };
