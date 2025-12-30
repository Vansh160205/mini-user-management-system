/**
 * User Management Controller
 * 
 * Handles user CRUD operations and management:
 * - List users (admin)
 * - Get user details
 * - Update user profile
 * - Change password
 * - Activate/deactivate users (admin)
 * - Delete users
 */

const { User } = require('../models');
const {
  asyncHandler,
  sendSuccess,
  sendPaginated,
  sendNoContent,
  hashPassword,
  comparePassword,
  validatePagination,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} = require('../utils');

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination (Admin only)
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    role,
    status,
    search,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = req.query;

  // Validate and sanitize pagination
  const pagination = validatePagination(page, limit);

  // Get paginated users
  const result = await User.findAll({
    page: pagination.page,
    limit: pagination.limit,
    role,
    status,
    search,
    sortBy,
    sortOrder,
  });

  sendPaginated(res, {
    message: 'Users retrieved successfully',
    data: result.users,
    pagination: result.pagination,
  });
});

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (Admin only)
 * @access  Private (Admin)
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.getStats();

  sendSuccess(res, {
    message: 'User statistics retrieved successfully',
    data: stats,
  });
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or own profile)
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check authorization
  if (req.user.role !== 'admin' && req.user.id !== id) {
    throw new ForbiddenError('You do not have permission to view this user');
  }

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  sendSuccess(res, {
    message: 'User retrieved successfully',
    data: {
      user,
    },
  });
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (Admin or own profile)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, full_name, role, status } = req.body;

  // Check authorization
  if (req.user.role !== 'admin' && req.user.id !== id) {
    throw new ForbiddenError('You do not have permission to update this user');
  }

  // Regular users cannot change their own role or status
  if (req.user.role !== 'admin' && (role !== undefined || status !== undefined)) {
    throw new ForbiddenError('You do not have permission to change role or status');
  }

  // Check if user exists
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new NotFoundError('User not found');
  }

  // Check email uniqueness if email is being updated
  if (email && email !== existingUser.email) {
    const emailExists = await User.emailExists(email, id);
    if (emailExists) {
      throw new ConflictError('Email already in use');
    }
  }

  // Prepare update data
  const updateData = {};
  if (email !== undefined) updateData.email = email;
  if (full_name !== undefined) updateData.full_name = full_name;
  if (role !== undefined && req.user.role === 'admin') updateData.role = role;
  if (status !== undefined && req.user.role === 'admin') updateData.status = status;

  // Update user
  const updatedUser = await User.update(id, updateData);

  sendSuccess(res, {
    message: 'User updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * @route   PATCH /api/users/:id/password
 * @desc    Change user password
 * @access  Private (Own profile only)
 */
const changePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { current_password, new_password } = req.body;

  // Users can only change their own password
  if (req.user.id !== id) {
    throw new ForbiddenError('You can only change your own password');
  }

  // Get user with password
  const user = await User.findById(id, true);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(current_password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(new_password);

  // Update password
  await User.update(id, { password: hashedPassword });

  sendSuccess(res, {
    message: 'Password changed successfully. Please login with your new password.',
    data: null,
  });
});

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user account (Admin only)
 * @access  Private (Admin)
 */
const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if already active
  if (user.status === 'active') {
    return sendSuccess(res, {
      message: 'User is already active',
      data: { user },
    });
  }

  // Activate user
  const updatedUser = await User.activate(id);

  sendSuccess(res, {
    message: 'User activated successfully',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user account (Admin only)
 * @access  Private (Admin)
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deactivation
  if (req.user.id === id) {
    throw new ForbiddenError('You cannot deactivate your own account');
  }

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if already inactive
  if (user.status === 'inactive') {
    return sendSuccess(res, {
      message: 'User is already inactive',
      data: { user },
    });
  }

  // Deactivate user
  const updatedUser = await User.deactivate(id);

  sendSuccess(res, {
    message: 'User deactivated successfully',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account
 * @access  Private (Admin or own profile)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check authorization
  if (req.user.role !== 'admin' && req.user.id !== id) {
    throw new ForbiddenError('You do not have permission to delete this user');
  }

  // Admin cannot delete themselves
  if (req.user.role === 'admin' && req.user.id === id) {
    throw new ForbiddenError('Admin cannot delete their own account');
  }

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Delete user
  const deleted = await User.delete(id);

  if (!deleted) {
    throw new Error('Failed to delete user');
  }

  sendNoContent(res);
});

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  sendSuccess(res, {
    message: 'Profile retrieved successfully',
    data: {
      user,
    },
  });
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { email, full_name } = req.body;
  const userId = req.user.id;

  // Check if user exists
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new NotFoundError('User not found');
  }

  // Check email uniqueness if email is being updated
  if (email && email !== existingUser.email) {
    const emailExists = await User.emailExists(email, userId);
    if (emailExists) {
      throw new ConflictError('Email already in use');
    }
  }

  // Prepare update data (users can't change their own role/status)
  const updateData = {};
  if (email !== undefined) updateData.email = email;
  if (full_name !== undefined) updateData.full_name = full_name;

  // Update user
  const updatedUser = await User.update(userId, updateData);

  sendSuccess(res, {
    message: 'Profile updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

module.exports = {
  getAllUsers,
  getUserStats,
  getUserById,
  updateUser,
  changePassword,
  activateUser,
  deactivateUser,
  deleteUser,
  getProfile,
  updateProfile,
};