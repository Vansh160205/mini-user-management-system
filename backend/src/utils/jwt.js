/**
 * JWT Token Utilities
 * 
 * Handles JSON Web Token generation, verification, and extraction.
 * Used for authentication and authorization.
 */

const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('./AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for a user
 * @param {object} payload - Token payload
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @param {object} [options] - Additional JWT options
 * @returns {string} JWT token
 */
const generateToken = (payload, options = {}) => {
  try {
    if (!payload.id || !payload.email || !payload.role) {
      throw new Error('Invalid token payload: id, email, and role are required');
    }

    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    const tokenOptions = {
      expiresIn: options.expiresIn || JWT_EXPIRES_IN,
      issuer: 'mini-user-management',
      audience: 'mini-user-management-client',
      ...options,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, tokenOptions);
    return token;
  } catch (error) {
    console.error('Token generation error:', error.message);
    throw new Error('Failed to generate token');
  }
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {UnauthorizedError} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'mini-user-management',
      audience: 'mini-user-management-client',
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token has expired');
    }
    
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token');
    }

    if (error.name === 'NotBeforeError') {
      throw new UnauthorizedError('Token not yet valid');
    }

    throw new UnauthorizedError('Token verification failed');
  }
};

/**
 * Extract token from Authorization header
 * Supports: "Bearer <token>" format
 * @param {object} req - Express request object
 * @returns {string|null} Extracted token or null
 */
const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return null;
  }

  // Check for "Bearer <token>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // If no "Bearer " prefix, treat the whole header as token
  return authHeader;
};

/**
 * Extract and verify token from request
 * @param {object} req - Express request object
 * @returns {object} Decoded token payload
 * @throws {UnauthorizedError} If token is missing or invalid
 */
const extractAndVerifyToken = (req) => {
  const token = extractTokenFromHeader(req);
  
  if (!token) {
    throw new UnauthorizedError('No authentication token provided');
  }

  return verifyToken(token);
};

/**
 * Decode token without verification
 * Useful for debugging or extracting payload before verification
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Token decode error:', error.message);
    return null;
  }
};

/**
 * Generate refresh token (longer expiration)
 * @param {object} payload - Token payload
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return generateToken(payload, { expiresIn: '30d' });
};

/**
 * Check if token is expired without throwing error
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  extractAndVerifyToken,
  decodeToken,
  generateRefreshToken,
  isTokenExpired,
  getTokenExpiration,
};