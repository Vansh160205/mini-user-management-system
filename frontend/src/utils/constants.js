/**
 * Application Constants
 * 
 * Centralized constants for the application
 */

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// User Status
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 25, 50],
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
};

// API Response messages
export const MESSAGES = {
  // Success messages
  LOGIN_SUCCESS: 'Login successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  USER_ACTIVATED: 'User activated successfully',
  USER_DEACTIVATED: 'User deactivated successfully',
  USER_DELETED: 'User deleted successfully',
  
  // Error messages
  LOGIN_FAILED: 'Invalid email or password',
  SIGNUP_FAILED: 'Failed to create account',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  ACCESS_DENIED: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Validation patterns
export const VALIDATION = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
};

// Password requirements
export const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'lowercase', label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { id: 'uppercase', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'number', label: 'One number', test: (pw) => /\d/.test(pw) },
  { id: 'special', label: 'One special character (@$!%*?&)', test: (pw) => /[@$!%*?&]/.test(pw) },
];

export default {
  ROLES,
  STATUS,
  PAGINATION,
  STORAGE_KEYS,
  ROUTES,
  MESSAGES,
  VALIDATION,
  PASSWORD_REQUIREMENTS,
};