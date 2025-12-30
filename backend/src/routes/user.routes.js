/**
 * User Management Routes
 * 
 * Defines routes for user CRUD operations.
 */

const express = require('express');
const userController = require('../controllers/user.controller');
const {
  authenticate,
  isAdmin,
  validateUUIDParam,
  validateUserUpdate,
  validatePasswordChange,
} = require('../middleware');

const router = express.Router();

// ==============================
// PROFILE ROUTES (Current User)
// ==============================

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', authenticate, validateUserUpdate, userController.updateProfile);

// ==============================
// ADMIN ROUTES
// ==============================

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticate, isAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, isAdmin, userController.getUserStats);

// ==============================
// USER MANAGEMENT ROUTES
// ==============================

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or own profile)
 */
router.get('/:id', authenticate, validateUUIDParam('id'), userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or own profile)
 */
router.put(
  '/:id',
  authenticate,
  validateUUIDParam('id'),
  validateUserUpdate,
  userController.updateUser
);

/**
 * @route   PATCH /api/users/:id/password
 * @desc    Change user password
 * @access  Private (Own profile only)
 */
router.patch(
  '/:id/password',
  authenticate,
  validateUUIDParam('id'),
  validatePasswordChange,
  userController.changePassword
);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user account (Admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:id/activate',
  authenticate,
  isAdmin,
  validateUUIDParam('id'),
  userController.activateUser
);

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user account (Admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  isAdmin,
  validateUUIDParam('id'),
  userController.deactivateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin or own profile)
 */
router.delete(
  '/:id',
  authenticate,
  validateUUIDParam('id'),
  userController.deleteUser
);

module.exports = router;