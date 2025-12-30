/**
 * Authentication Routes
 * 
 * Defines routes for user authentication operations.
 */

const express = require('express');
const { authController } = require('../controllers');
const {
  validateSignup,
  validateLogin,
  authenticate,
  rateLimitAuth,
} = require('../middleware');

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validateSignup, authController.signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', rateLimitAuth, validateLogin, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authenticate, authController.refreshToken);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify JWT token validity
 * @access  Private
 */
router.post('/verify', authenticate, authController.verifyToken);

module.exports = router;