/**
 * Standardized API response helper.
 * Attaches a .success() method to the Express response object
 * via the apiResponse middleware, ensuring all responses share
 * a consistent JSON shape.
 *
 * Shape:
 * {
 *   success: true,
 *   message: "...",
 *   data: { ... },          // optional
 *   pagination: { ... }     // optional
 * }
 */
const apiResponse = (req, res, next) => {
  res.success = (message, data = null, statusCode = 200, pagination = null) => {
    const response = { success: true, message };
    if (data !== null) response.data = data;
    if (pagination !== null) response.pagination = pagination;
    return res.status(statusCode).json(response);
  };
  next();
};

module.exports = apiResponse;
