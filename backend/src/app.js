/**
 * Express Application Configuration
 * 
 * Sets up middleware, routes, and error handling.
 * Exported for use in server.js and testing.
 */

const express = require('express');
const cors = require('cors');

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
    documentation: '/api/docs',
    health: '/api/health',
  });
});

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

  res.status(statusCode).json({
    success: false,
    message: message,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

module.exports = app;