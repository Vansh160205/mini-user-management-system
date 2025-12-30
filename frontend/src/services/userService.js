/**
 * User Management Service
 * 
 * Handles all user-related API calls:
 * - Get all users (admin)
 * - Get user by ID
 * - Update user
 * - Change password
 * - Activate/Deactivate user (admin)
 * - Delete user (admin)
 * - Get user statistics (admin)
 */

import api from './api';

const USER_ENDPOINTS = {
  USERS: '/users',
  STATS: '/users/stats',
};

/**
 * Get all users with optional filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.role - Filter by role
 * @param {string} params.status - Filter by status
 * @param {string} params.search - Search by name or email
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @returns {Promise<Object>} - Paginated users list
 */
export const getAllUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add parameters to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  const url = queryString ? `${USER_ENDPOINTS.USERS}?${queryString}` : USER_ENDPOINTS.USERS;
  
  return await api.get(url);
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data
 */
export const getUserById = async (userId) => {
  return await api.get(`${USER_ENDPOINTS.USERS}/${userId}`);
};

/**
 * Update user data
 * @param {string} userId - User ID
 * @param {Object} userData - Data to update
 * @param {string} userData.full_name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.role - User's role (admin only)
 * @param {string} userData.status - User's status (admin only)
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUser = async (userId, userData) => {
  return await api.put(`${USER_ENDPOINTS.USERS}/${userId}`, userData);
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.current_password - Current password
 * @param {string} passwordData.new_password - New password
 * @returns {Promise<Object>} - Success response
 */
export const changePassword = async (userId, passwordData) => {
  return await api.patch(`${USER_ENDPOINTS.USERS}/${userId}/password`, passwordData);
};

/**
 * Activate a user (admin only)
 * @param {string} userId - User ID to activate
 * @returns {Promise<Object>} - Updated user data
 */
export const activateUser = async (userId) => {
  return await api.patch(`${USER_ENDPOINTS.USERS}/${userId}/activate`);
};

/**
 * Deactivate a user (admin only)
 * @param {string} userId - User ID to deactivate
 * @returns {Promise<Object>} - Updated user data
 */
export const deactivateUser = async (userId) => {
  return await api.patch(`${USER_ENDPOINTS.USERS}/${userId}/deactivate`);
};

/**
 * Delete a user (admin only)
 * @param {string} userId - User ID to delete
 * @returns {Promise<Object>} - Success response
 */
export const deleteUser = async (userId) => {
  return await api.delete(`${USER_ENDPOINTS.USERS}/${userId}`);
};

/**
 * Get user statistics (admin only)
 * @returns {Promise<Object>} - User statistics
 */
export const getUserStats = async () => {
  return await api.get(USER_ENDPOINTS.STATS);
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  activateUser,
  deactivateUser,
  deleteUser,
  getUserStats,
};