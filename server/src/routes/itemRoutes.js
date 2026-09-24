const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { ROLES } = require('../config/constants');
const { validateCreateItem } = require('../validators/itemValidators');
const {
  createItem,
  getMyItems,
  getItemById,
} = require('../controllers/itemController');

// All item endpoints require authentication
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

// @route   GET /api/v1/items/:id
// @desc    Get item details by item ID
// @access  Private (Owner of the item, Admin)
router.get(
  '/:id',
  getItemById
);

module.exports = router;
