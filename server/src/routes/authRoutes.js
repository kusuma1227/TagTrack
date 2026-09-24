const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
} = require('../validators/authValidators');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

// @route   POST /api/v1/auth/register
// @desc    Register a new user (owner or finder only)
// @access  Public
router.post('/register', validateRegister, validate, register);

// @route   POST /api/v1/auth/login
// @desc    Login and receive a JWT token
// @access  Public
router.post('/login', validateLogin, validate, login);

// @route   GET /api/v1/auth/me
// @desc    Get the currently authenticated user's profile
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT /api/v1/auth/me
// @desc    Update profile fields (name, phone, address)
// @access  Private
router.put('/me', auth, validateUpdateProfile, validate, updateProfile);

// @route   PUT /api/v1/auth/me/password
// @desc    Change password
// @access  Private
router.put('/me/password', auth, validateChangePassword, validate, changePassword);

module.exports = router;
