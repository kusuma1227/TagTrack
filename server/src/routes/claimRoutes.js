const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { ROLES } = require('../config/constants');
const { validateUpdateClaimStatus } = require('../validators/claimValidators');
const {
  getClaims,
  getClaimById,
  updateClaimStatus,
} = require('../controllers/claimController');

// All claims verification routes require authentication and officer or admin role
router.use(auth);
router.use(authorize(ROLES.OFFICER, ROLES.ADMIN));

// @route   GET /api/v1/claims
// @desc    Get all claims for officer verification
// @access  Private (Officer, Admin)
router.get('/', getClaims);

// @route   GET /api/v1/claims/:id
// @desc    Get specific claim details by ID
// @access  Private (Officer, Admin)
router.get('/:id', getClaimById);

// @route   PUT /api/v1/claims/:id/status
// @desc    Update claim status (Approve / Reject / Under Review)
// @access  Private (Officer, Admin)
router.put('/:id/status', validateUpdateClaimStatus, validate, updateClaimStatus);
router.patch('/:id/status', validateUpdateClaimStatus, validate, updateClaimStatus);

module.exports = router;
