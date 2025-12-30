/**
 * Utils Index
 * 
 * Central export point for all utility modules.
 */

const {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
  DatabaseError,
} = require('./AppError');

const asyncHandler = require('./asyncHandler');

const {
  sendSuccess,
  sendError,
  sendPaginated,
  sendCreated,
  sendNoContent,
} = require('./response');

const {
  isValidEmail,
  validatePassword,
  isValidUUID,
  validateFullName,
  isValidRole,
  isValidStatus,
  sanitizeString,
  validatePagination,
  isEmpty,
} = require('./validators');

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
  DatabaseError,
  
  // Async handler
  asyncHandler,
  
  // Response formatters
  sendSuccess,
  sendError,
  sendPaginated,
  sendCreated,
  sendNoContent,
  
  // Validators
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