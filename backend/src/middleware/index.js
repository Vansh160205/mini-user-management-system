/**
 * Middleware Index
 * 
 * Central export point for all middleware.
 */

const {
  authenticate,
  authorize,
  optionalAuth,
  verifyOwnership,
  isAdmin,
  isUser,
  rateLimitAuth,
} = require('./auth.middleware');

const {
  validateSignup,
  validateLogin,
  validateUserUpdate,
  validatePasswordChange,
  validateUUIDParam,
} = require('./validation.middleware');

module.exports = {
  // Authentication & Authorization
  authenticate,
  authorize,
  optionalAuth,
  verifyOwnership,
  isAdmin,
  isUser,
  rateLimitAuth,
  
  // Validation
  validateSignup,
  validateLogin,
  validateUserUpdate,
  validatePasswordChange,
  validateUUIDParam,
};