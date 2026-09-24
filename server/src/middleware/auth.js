const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * auth middleware
 * ---
 * 1. Reads the JWT from the Authorization header (Bearer token)
 * 2. Verifies the token signature and expiry
 * 3. Fetches the user from DB (ensures user still exists and is active)
 * 4. Attaches the user to req.user
 * 5. Calls next()
 *
 * Throws ApiError 401 if anything fails.
 */
const auth = async (req, res, next) => {
  try {
    // Extract token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Access denied. No token provided.', 'NO_TOKEN');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (catches deactivated accounts after token issue)
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      throw new ApiError(401, 'User no longer exists.', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Your account has been suspended. Contact support.', 'ACCOUNT_SUSPENDED');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
