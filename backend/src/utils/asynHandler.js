/**
 * Async Handler Wrapper
 * 
 * Wraps async route handlers to catch errors and pass them
 * to the Express error handling middleware.
 * Eliminates the need for try-catch blocks in controllers.
 */

/**
 * Wrap async function to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;