/**
 * Express Application Configuration
 * 
 * Sets up middleware, routes, and error handling.
 * Exported for use in server.js and testing.
 */

const express = require('express');
const cors = require('cors');
const { authRoutes, userRoutes } = require('./routes');
const { sendError } = require('./utils');

const app = express();

// ======================
// MIDDLEWARE
// ======================

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// ======================
// ROUTES
// ======================

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

/**
 * @route   GET /
 * @desc    API root endpoint
 * @access  Public
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mini User Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ======================
// ERROR HANDLING
// ======================

// 404 Handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: {
      code: 'NOT_FOUND',
      status: 404,
    },
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  // Handle validation errors with details
  if (err.errors && Array.isArray(err.errors)) {
    return sendError(res, {
      statusCode,
      message,
      code,
      errors: err.errors,
    });
  }

  // Handle database errors
  if (err.code === '23505') {
    return sendError(res, {
      statusCode: 409,
      message: 'Duplicate entry. Resource already exists.',
      code: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === '23503') {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid reference. Related resource not found.',
      code: 'INVALID_REFERENCE',
    });
  }

  // Send error response
  sendError(res, {
    statusCode,
    message,
    code,
    errors: process.env.NODE_ENV === 'development' ? err : null,
  });
});

module.exports = app;