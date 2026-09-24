const ApiError = require('../utils/ApiError');

/**
 * authorize(...roles) — RBAC middleware factory
 * ---
 * Returns a middleware that checks if req.user.role is in the allowed roles list.
 * Must always be used AFTER the auth middleware.
 *
 * Usage:
 *   router.delete('/:id', auth, authorize('admin'), deleteUser);
 *   router.put('/:id/review', auth, authorize('officer', 'admin'), reviewClaim);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.', 'AUTH_REQUIRED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

module.exports = authorize;
