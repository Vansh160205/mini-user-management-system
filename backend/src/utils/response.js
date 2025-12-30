/**
 * Response Formatter Utilities
 * 
 * Standardized response formats for consistent API responses.
 */

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {object} options - Response options
 * @param {number} [options.statusCode=200] - HTTP status code
 * @param {string} [options.message] - Success message
 * @param {any} [options.data] - Response data
 * @param {object} [options.meta] - Additional metadata
 */
const sendSuccess = (res, { statusCode = 200, message, data = null, meta = null }) => {
  const response = {
    success: true,
  };

  if (message) {
    response.message = message;
  }

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {object} options - Response options
 * @param {number} [options.statusCode=500] - HTTP status code
 * @param {string} options.message - Error message
 * @param {string} [options.code] - Error code
 * @param {any} [options.errors] - Validation errors or details
 */
const sendError = (res, { statusCode = 500, message, code = 'ERROR', errors = null }) => {
  const response = {
    success: false,
    message,
    error: {
      code,
      status: statusCode,
    },
  };

  if (errors) {
    response.error.details = errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && errors?.stack) {
    response.error.stack = errors.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {object} res - Express response object
 * @param {object} options - Response options
 * @param {Array} options.data - Array of items
 * @param {object} options.pagination - Pagination metadata
 * @param {string} [options.message] - Success message
 */
const sendPaginated = (res, { data, pagination, message }) => {
  return sendSuccess(res, {
    statusCode: 200,
    message,
    data,
    meta: { pagination },
  });
};

/**
 * Send created response (201)
 * @param {object} res - Express response object
 * @param {object} options - Response options
 */
const sendCreated = (res, { message, data }) => {
  return sendSuccess(res, {
    statusCode: 201,
    message,
    data,
  });
};

/**
 * Send no content response (204)
 * @param {object} res - Express response object
 */
const sendNoContent = (res) => {
  return res.status(204).send();
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  sendCreated,
  sendNoContent,
};