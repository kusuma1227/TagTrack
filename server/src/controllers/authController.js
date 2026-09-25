const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Auth Controller
 * ───────────────
 * register       POST /api/v1/auth/register
 * login          POST /api/v1/auth/login
 * getMe          GET  /api/v1/auth/me
 * updateProfile  PUT  /api/v1/auth/me
 * changePassword PUT  /api/v1/auth/me/password
 */

// ── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, role } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required', 'MISSING_FIELDS');
    }

    // Check for existing user with case-insensitive lowercase query
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists', 'EMAIL_IN_USE');
    }

    // Create user — password is set on passwordHash field, hashed by pre-save hook
    const user = await User.create({
      name: name.trim(),
      email,
      passwordHash: password,
      role: role || 'owner',
    });

    // Generate JWT
    const token = user.generateToken();

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to TagTrack!',
      data: {
        token,
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required', 'MISSING_FIELDS');
    }

    // Fetch user WITH passwordHash (select: false by default on schema)
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Your account has been suspended. Contact support.', 'ACCOUNT_SUSPENDED');
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const token = user.generateToken();

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Current User ──────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by auth middleware (no passwordHash)
    return res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user: req.user.toPublicJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'address'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'No valid fields provided for update', 'NO_UPDATES');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toPublicJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// ── Change Password ───────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch with passwordHash for comparison
    const user = await User.findById(req.user._id).select('+passwordHash');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect', 'WRONG_PASSWORD');
    }

    if (currentPassword === newPassword) {
      throw new ApiError(400, 'New password must be different from current password', 'SAME_PASSWORD');
    }

    // Set new password — pre-save hook will hash it
    user.passwordHash = newPassword;
    await user.save();

    // Issue a new token (invalidates old sessions effectively)
    const token = user.generateToken();

    return res.json({
      success: true,
      message: 'Password changed successfully',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
