const ApiError = require('../utils/ApiError');

/**
 * Global Express error handler.
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * Handles:
 *  - ApiError (operational errors: 4xx)
 *  - Mongoose CastError (invalid ObjectId → 400)
 *  - Mongoose ValidationError (schema validation → 400)
 *  - Mongoose duplicate key error (11000 → 409)
 *  - JWT errors (401)
 *  - Generic errors (500)
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';
  let errors = err.errors || [];

  // ── Mongoose: Invalid ObjectId ──────────────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    code = 'INVALID_ID';
  }

  // ── Mongoose: Validation Error ──────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose: Duplicate Key ──────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists`;
    code = 'DUPLICATE_KEY';
  }

  // ── JWT: Invalid Token ───────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
    code = 'INVALID_TOKEN';
  }

  // ── JWT: Expired Token ───────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
    code = 'TOKEN_EXPIRED';
  }

  const response = {
    success: false,
    message,
    error: code,
    statusCode,
  };

  if (errors.length > 0) response.errors = errors;

  // Only expose stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
