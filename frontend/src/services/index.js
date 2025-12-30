/**
 * Services Index
 * 
 * Central export for all API services
 */

export { default as api } from './api';
export { default as authService } from './authService';
export { default as userService } from './userService';

// Named exports from authService
export {
  signup,
  login,
  logout,
  getCurrentUser,
  verifyToken,
  getToken,
  getStoredUser,
  isAuthenticated,
  isAdmin,
} from './authService';

// Named exports from userService
export {
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  activateUser,
  deactivateUser,
  deleteUser,
  getUserStats,
} from './userService';