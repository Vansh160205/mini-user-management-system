/**
 * Authentication Controller
 * 
 * Handles user authentication operations:
 * - Signup (registration)
 * - Login
 * - Get current user
 * - Logout
 */

const { User } = require('../models');
const {
  asyncHandler,
  hashPassword,
  comparePassword,
  generateToken,
  sendSuccess,
  sendCreated,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} = require('../utils');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const { email, password, full_name, role = 'user' } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser = await User.create({
    email,
    password: hashedPassword,
    full_name,
    role,
    status: 'active',
  });

  // Generate JWT token
  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  // Update last login
  await User.updateLastLogin(newUser.id);

  // Send response
  sendCreated(res, {
    message: 'User registered successfully',
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        status: newUser.status,
        created_at: newUser.created_at,
      },
      token,
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findByEmail(email, true);

  if (!user) {
    // Track failed login attempt if middleware exists
    if (req.trackFailedLogin) {
      req.trackFailedLogin();
    }
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if user is active
  if (user.status === 'inactive') {
    throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    // Track failed login attempt if middleware exists
    if (req.trackFailedLogin) {
      req.trackFailedLogin();
    }
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Update last login timestamp
  await User.updateLastLogin(user.id);

  // Send response (exclude password)
  sendSuccess(res, {
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at,
      },
      token,
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is set by authenticate middleware
  const userId = req.user.id;

  // Fetch fresh user data from database
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  sendSuccess(res, {
    message: 'User retrieved successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    },
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 * 
 * Note: With JWT, logout is primarily handled client-side by removing the token.
 * This endpoint exists for consistency and can be extended for token blacklisting.
 */
const logout = asyncHandler(async (req, res) => {
  // In a JWT-based system, logout is handled client-side
  // The client should remove the token from storage
  
  // Optional: Implement token blacklisting here if needed
  // For now, we'll just return a success response
  
  sendSuccess(res, {
    message: 'Logout successful. Please remove the token from client storage.',
    data: null,
  });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Private
 */
const refreshToken = asyncHandler(async (req, res) => {
  // req.user is set by authenticate middleware
  const userId = req.user.id;

  // Fetch user to ensure they still exist and are active
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.status === 'inactive') {
    throw new UnauthorizedError('Your account has been deactivated');
  }

  // Generate new token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  sendSuccess(res, {
    message: 'Token refreshed successfully',
    data: {
      token,
    },
  });
});

/**
 * @route   POST /api/auth/verify
 * @desc    Verify if token is valid
 * @access  Private
 */
const verifyToken = asyncHandler(async (req, res) => {
  // If this endpoint is reached, the token is valid (authenticate middleware passed)
  sendSuccess(res, {
    message: 'Token is valid',
    data: {
      user: req.user,
      valid: true,
    },
  });
});

module.exports = {
  signup,
  login,
  getCurrentUser,
  logout,
  refreshToken,
  verifyToken,
};