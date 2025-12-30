/**
 * Validation Middleware
 * 
 * Request validation middleware for common validation scenarios.
 */

const {
  ValidationError,
  isValidEmail,
  validatePassword,
  isValidUUID,
  validateFullName,
  isValidRole,
  isValidStatus,
  sanitizeString,
  isEmpty,
} = require('../utils');

/**
 * Validate user registration data
 */
const validateSignup = (req, res, next) => {
  const { email, password, full_name } = req.body;
  const errors = [];

  // Validate email
  if (isEmpty(email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  // Validate password
  if (isEmpty(password)) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      passwordValidation.errors.forEach(error => {
        errors.push({ field: 'password', message: error });
      });
    }
  }

  // Validate full name
  if (isEmpty(full_name)) {
    errors.push({ field: 'full_name', message: 'Full name is required' });
  } else {
    const nameValidation = validateFullName(full_name);
    if (!nameValidation.valid) {
      errors.push({ field: 'full_name', message: nameValidation.error });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // Sanitize inputs
  req.body.email = sanitizeString(email).toLowerCase();
  req.body.full_name = sanitizeString(full_name);

  next();
};

/**
 * Validate login data
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (isEmpty(email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (isEmpty(password)) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // Sanitize email
  req.body.email = sanitizeString(email).toLowerCase();

  next();
};

/**
 * Validate user update data
 */
const validateUserUpdate = (req, res, next) => {
  const { email, full_name, role, status } = req.body;
  const errors = [];

  // Validate email if provided
  if (email !== undefined) {
    if (isEmpty(email)) {
      errors.push({ field: 'email', message: 'Email cannot be empty' });
    } else if (!isValidEmail(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    } else {
      req.body.email = sanitizeString(email).toLowerCase();
    }
  }

  // Validate full name if provided
  if (full_name !== undefined) {
    if (isEmpty(full_name)) {
      errors.push({ field: 'full_name', message: 'Full name cannot be empty' });
    } else {
      const nameValidation = validateFullName(full_name);
      if (!nameValidation.valid) {
        errors.push({ field: 'full_name', message: nameValidation.error });
      } else {
        req.body.full_name = sanitizeString(full_name);
      }
    }
  }

  // Validate role if provided
  if (role !== undefined && !isValidRole(role)) {
    errors.push({ field: 'role', message: 'Invalid role. Must be admin or user' });
  }

  // Validate status if provided
  if (status !== undefined && !isValidStatus(status)) {
    errors.push({ field: 'status', message: 'Invalid status. Must be active or inactive' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  next();
};

/**
 * Validate password change data
 */
const validatePasswordChange = (req, res, next) => {
  const { current_password, new_password } = req.body;
  const errors = [];

  if (isEmpty(current_password)) {
    errors.push({ field: 'current_password', message: 'Current password is required' });
  }

  if (isEmpty(new_password)) {
    errors.push({ field: 'new_password', message: 'New password is required' });
  } else {
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      passwordValidation.errors.forEach(error => {
        errors.push({ field: 'new_password', message: error });
      });
    }
  }

  if (current_password === new_password) {
    errors.push({ 
      field: 'new_password', 
      message: 'New password must be different from current password' 
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  next();
};

/**
 * Validate UUID parameter
 */
const validateUUIDParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      throw new ValidationError(`Parameter '${paramName}' is required`);
    }

    if (!isValidUUID(id)) {
      throw new ValidationError(`Invalid ${paramName} format`);
    }

    next();
  };
};

module.exports = {
  validateSignup,
  validateLogin,
  validateUserUpdate,
  validatePasswordChange,
  validateUUIDParam,
};