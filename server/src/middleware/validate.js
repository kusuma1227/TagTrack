const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * validate middleware
 * ---
 * Collects all express-validator errors from the request.
 * If errors exist, throws a 400 ApiError with the field-level errors array.
 * Otherwise calls next().
 *
 * Usage: place after any validateXxx array in a route:
 *   router.post('/register', validateRegister, validate, register);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', formatted));
  }
  next();
};

module.exports = validate;
