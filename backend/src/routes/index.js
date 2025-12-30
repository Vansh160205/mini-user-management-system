/**
 * Routes Index
 * 
 * Central export point for all routes.
 * Aggregates all route modules for easy import in app.js
 */

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

module.exports = {
  authRoutes,
  userRoutes,
};