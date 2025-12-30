/**
 * Validation Helper Functions
 * 
 * Reusable validation utilities for common patterns.
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate UUID format
 * @param {string} id - UUID to validate
 * @returns {boolean} True if valid UUID v4
 */
const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validate full name
 * @param {string} name - Name to validate
 * @returns {object} { valid: boolean, error: string|null }
 */
const validateFullName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name must not exceed 100 characters' };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true, error: null };
};

/**
 * Validate role
 * @param {string} role - Role to validate
 * @returns {boolean} True if valid role
 */
const isValidRole = (role) => {
  return ['admin', 'user'].includes(role);
};

/**
 * Validate status
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid status
 */
const isValidStatus = (status) => {
  return ['active', 'inactive'].includes(status);
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validate pagination parameters
 * @param {number|string} page - Page number
 * @param {number|string} limit - Items per page
 * @returns {object} { page: number, limit: number }
 */
const validatePagination = (page, limit) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  return {
    page: parsedPage > 0 ? parsedPage : 1,
    limit: parsedLimit > 0 && parsedLimit <= 100 ? parsedLimit : 10,
  };
};

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

module.exports = {
  isValidEmail,
  validatePassword,
  isValidUUID,
  validateFullName,
  isValidRole,
  isValidStatus,
  sanitizeString,
  validatePagination,
  isEmpty,
};