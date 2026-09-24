/**
 * Custom API Error class.
 * Extends the native Error class to add an HTTP statusCode
 * and a machine-readable error code.
 *
 * Usage:
 *   throw new ApiError(404, 'Item not found', 'ITEM_NOT_FOUND');
 */
class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR', errors = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors; // Array of field-level validation errors
    this.isOperational = true; // Distinguishes expected errors from programming bugs

    // Capture stack trace (Node.js V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
