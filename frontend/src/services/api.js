/**
 * API Service Configuration
 * 
 * Centralized Axios instance with interceptors for:
 * - Request: Adds authentication token
 * - Response: Handles errors globally
 */

import axios from 'axios';

// API Base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds JWT token to request headers if available
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global error responses
 */
api.interceptors.response.use(
  (response) => {
    // Return successful response data
    return response.data;
  },
  (error) => {
    // Handle specific error cases
    const { response } = error;
    
    if (response) {
      // Server responded with error
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          // Clear local storage and redirect to login
          if (data?.message?.includes('expired') || data?.message?.includes('Invalid token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login?session=expired';
            }
          }
          break;
          
        case 403:
          // Forbidden - Insufficient permissions
          console.error('Access denied:', data?.message);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', data?.message);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data?.message);
          break;
          
        default:
          break;
      }
      
      // Return error response for component-level handling
      return Promise.reject({
        status,
        message: data?.message || 'An error occurred',
        errors: data?.error?.details || [],
        data: data,
      });
    }
    
    // Network error or no response
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        status: 408,
        message: 'Request timeout. Please try again.',
        errors: [],
      });
    }
    
    return Promise.reject({
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: [],
    });
  }
);

export default api;