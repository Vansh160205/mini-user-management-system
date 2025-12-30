/**
 * Form Validation Utilities
 * 
 * Functions for validating form inputs
 */

import { VALIDATION, PASSWORD_REQUIREMENTS } from './constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result { isValid, error }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!VALIDATION.EMAIL_PATTERN.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result { isValid, error, requirements }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { 
      isValid: false, 
      error: 'Password is required',
      requirements: PASSWORD_REQUIREMENTS.map(req => ({ ...req, met: false }))
    };
  }
  
  const requirements = PASSWORD_REQUIREMENTS.map(req => ({
    ...req,
    met: req.test(password),
  }));
  
  const allMet = requirements.every(req => req.met);
  
  if (!allMet) {
    return {
      isValid: false,
      error: 'Password does not meet all requirements',
      requirements,
    };
  }
  
  return { isValid: true, error: null, requirements };
};

/**
 * Validate full name
 * @param {string} name - Name to validate
 * @returns {Object} - Validation result { isValid, error }
 */
export const validateFullName = (name) => {
  if (!name) {
    return { isValid: false, error: 'Full name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters` };
  }
  
  if (trimmedName.length > VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, error: `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters` };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} - Validation result { isValid, error }
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate signup form
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result { isValid, errors }
 */
export const validateSignupForm = (formData) => {
  const errors = {};
  
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  const passwordResult = validatePassword(formData.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }
  
  const nameResult = validateFullName(formData.full_name);
  if (!nameResult.isValid) {
    errors.full_name = nameResult.error;
  }
  
  if (formData.confirmPassword !== undefined) {
    const confirmResult = validatePasswordConfirmation(formData.password, formData.confirmPassword);
    if (!confirmResult.isValid) {
      errors.confirmPassword = confirmResult.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result { isValid, errors }
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate profile update form
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result { isValid, errors }
 */
export const validateProfileForm = (formData) => {
  const errors = {};
  
  if (formData.email !== undefined) {
    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
    }
  }
  
  if (formData.full_name !== undefined) {
    const nameResult = validateFullName(formData.full_name);
    if (!nameResult.isValid) {
      errors.full_name = nameResult.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate password change form
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result { isValid, errors }
 */
export const validatePasswordChangeForm = (formData) => {
  const errors = {};
  
  if (!formData.current_password) {
    errors.current_password = 'Current password is required';
  }
  
  const newPasswordResult = validatePassword(formData.new_password);
  if (!newPasswordResult.isValid) {
    errors.new_password = newPasswordResult.error;
  }
  
  if (formData.confirm_password !== undefined) {
    const confirmResult = validatePasswordConfirmation(formData.new_password, formData.confirm_password);
    if (!confirmResult.isValid) {
      errors.confirm_password = confirmResult.error;
    }
  }
  
  // Ensure new password is different from current
  if (formData.current_password && formData.new_password && 
      formData.current_password === formData.new_password) {
    errors.new_password = 'New password must be different from current password';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePasswordConfirmation,
  validateSignupForm,
  validateLoginForm,
  validateProfileForm,
  validatePasswordChangeForm,
};