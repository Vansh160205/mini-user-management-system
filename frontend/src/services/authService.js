/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls:
 * - Signup
 * - Login
 * - Logout
 * - Get current user
 * - Verify token
 */

import api from './api';

const AUTH_ENDPOINTS = {
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  ME: '/auth/me',
  VERIFY: '/auth/verify',
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.full_name - User full name
 * @returns {Promise<Object>} - Registration response with token and user
 */
export const signup = async (userData) => {
  const response = await api.post(AUTH_ENDPOINTS.SIGNUP, userData);
  
  if (response.success && response.data?.token) {
    // Store token and user in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Login user with credentials
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} - Login response with token and user
 */
export const login = async (credentials) => {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
  
  if (response.success && response.data?.token) {
    // Store token and user in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Logout current user
 * Clears local storage and optionally notifies server
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get current authenticated user
 * @returns {Promise<Object>} - Current user data
 */
export const getCurrentUser = async () => {
  const response = await api.get(AUTH_ENDPOINTS.ME);
  
  if (response.success && response.data?.user) {
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Verify if current token is valid
 * @returns {Promise<Object>} - Token verification result
 */
export const verifyToken = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return { success: false, data: { valid: false } };
  }
  
  try {
    const response = await api.post(AUTH_ENDPOINTS.VERIFY);
    return response;
  } catch (error) {
    // Token is invalid
    logout();
    return { success: false, data: { valid: false } };
  }
};

/**
 * Get stored token
 * @returns {string|null} - JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get stored user
 * @returns {Object|null} - User object or null
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Check if current user is admin
 * @returns {boolean} - True if user role is admin
 */
export const isAdmin = () => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

export default {
  signup,
  login,
  logout,
  getCurrentUser,
  verifyToken,
  getToken,
  getStoredUser,
  isAuthenticated,
  isAdmin,
};