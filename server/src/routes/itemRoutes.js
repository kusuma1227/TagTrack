const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { ROLES } = require('../config/constants');
const { validateCreateItem, validateReportFound } = require('../validators/itemValidators');
const {
  createItem,
  getMyItems,
  getItemById,
  markItemLost,
  getItemByTagId,
  reportItemFound,
  getMyFoundReports,
} = require('../controllers/itemController');

// ── Public Routes (No authentication required) ──────────────────────────────
// @route   GET /api/v1/items/tag/:tagId
// @desc    Get public item details by Tag ID
// @access  Public
router.get('/tag/:tagId', getItemByTagId);

// @route   POST /api/v1/items/:tagId/found
// @desc    Submit a found report for a lost item
// @access  Public
router.post(
  '/:tagId/found',
  validateReportFound,
  validate,
  reportItemFound
);

// ── Protected Routes (Require authentication) ───────────────────────────────
router.use(auth);

// @route   POST /api/v1/items
// @desc    Register a new item with auto-generated Tag ID and QR code
// @access  Private (Owner, Admin)
router.post(
  '/',
  authorize(ROLES.OWNER, ROLES.ADMIN),
  validateCreateItem,
  validate,
  createItem
);

// @route   GET /api/v1/items/my-items
// @desc    Get all registered items belonging to the authenticated owner
// @access  Private (Owner, Admin)
router.get(
  '/my-items',
  authorize(ROLES.OWNER, ROLES.ADMIN),
  getMyItems
);

// @route   PATCH /api/v1/items/:id/lost
// @desc    Mark a registered item as lost
// @access  Private (Owner of the item)
router.patch(
  '/:id/lost',
  authorize(ROLES.OWNER),
  markItemLost
);

// @route   GET /api/v1/items/found-reports
// @desc    Get all found reports submitted for items owned by the authenticated owner
// @access  Private (Owner, Admin)
router.get(
  '/found-reports',
  authorize(ROLES.OWNER, ROLES.ADMIN),
  getMyFoundReports
);

// @route   GET /api/v1/items/:id
// @desc    Get item details by item ID
// @access  Private (Owner of the item, Admin)
router.get(
  '/:id',
  getItemById
);

module.exports = router;
