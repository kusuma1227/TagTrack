require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const claimRoutes = require('./src/routes/claimRoutes');

// Connect to database
connectDB();

const app = express();

// Trust reverse proxy (e.g. Render, Vercel) for accurate client IP in rate limiting
app.set('trust proxy', 1);

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS Configuration ───────────────────────────────────────────────────────
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'https://tag-track-chi.vercel.app',
];

const getEnvOrigins = () => {
  if (!process.env.CLIENT_URL) return [];
  return process.env.CLIENT_URL.split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, Postman, health checks)
    if (!origin) return callback(null, true);

    const allowedOrigins = [...defaultAllowedOrigins, ...getEnvOrigins()];
    const normalizedOrigin = origin.replace(/\/$/, '');

    // Allow configured origins or any Vercel app domain
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      /^https:\/\/tag-track[a-zA-Z0-9-]*\.vercel\.app$/.test(normalizedOrigin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TagTrack API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
// Apply auth rate limiter to auth routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/claims', claimRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 TagTrack Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
