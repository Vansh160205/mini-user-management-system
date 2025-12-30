/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches authenticated user to request object.
 * Protects routes that require authentication.
 */

const { User } = require('../models');
const {
  extractAndVerifyToken,
  UnauthorizedError,
  ForbiddenError,
} = require('../utils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authenticate user from JWT token
 * Verifies token and attaches user object to req.user
 * @throws {UnauthorizedError} If token is missing or invalid
 * @throws {UnauthorizedError} If user not found or inactive
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Extract and verify token
  const decoded = extractAndVerifyToken(req);

  // Fetch user from database
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new UnauthorizedError('User not found. Please login again.');
  }

  // Check if user is active
  if (user.status === 'inactive') {
    throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
  }

  // Attach user to request object (without password)
  req.user = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    status: user.status,
  };

  next();
});

/**
 * Authorize user based on roles
 * Must be used after authenticate middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware
 * @throws {ForbiddenError} If user doesn't have required role
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`
      );
    }

    next();
  };
};

/**
 * Optional authentication
 * Attaches user to request if valid token is provided
 * Does NOT throw error if token is missing or invalid
 * Useful for routes that have different behavior for authenticated users
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const decoded = extractAndVerifyToken(req);
    const user = await User.findById(decoded.id);

    if (user && user.status === 'active') {
      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
      };
    }
  } catch (error) {
    // Silently fail - this is optional authentication
    req.user = null;
  }

  next();
});

/**
 * Verify user owns the resource
 * Checks if authenticated user's ID matches the resource's user ID
 * Admins bypass this check
 * @param {string} paramName - Name of the route parameter containing user ID
 * @returns {Function} Express middleware
 * @throws {ForbiddenError} If user doesn't own the resource
 */
const verifyOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Admins can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceUserId = req.params[paramName] || req.body[paramName];

    if (!resourceUserId) {
      throw new Error(`Parameter '${paramName}' not found in request`);
    }

    if (req.user.id !== resourceUserId) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

/**
 * Check if user is admin
 * Shorthand for authorize('admin')
 */
const isAdmin = authorize('admin');

/**
 * Check if user is regular user
 * Shorthand for authorize('user')
 */
const isUser = authorize('user');

/**
 * Rate limit authentication attempts (basic implementation)
 * Tracks failed attempts by IP address
 */
const loginAttempts = new Map();

const rateLimitAuth = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, []);
  }

  const attempts = loginAttempts.get(ip);
  
  // Remove old attempts outside the time window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  loginAttempts.set(ip, recentAttempts);

  if (recentAttempts.length >= maxAttempts) {
    throw new Error('Too many login attempts. Please try again later.');
  }

  // Add middleware to track failed attempts
  req.trackFailedLogin = () => {
    const currentAttempts = loginAttempts.get(ip) || [];
    currentAttempts.push(now);
    loginAttempts.set(ip, currentAttempts);
  };

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  verifyOwnership,
  isAdmin,
  isUser,
  rateLimitAuth,
};