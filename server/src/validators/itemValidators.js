const { body } = require('express-validator');
const { ITEM_CATEGORIES } = require('../config/constants');

/**
 * Validation rules for creating a new item
 */
const validateCreateItem = [
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(ITEM_CATEGORIES)
    .withMessage(`Category must be one of: ${ITEM_CATEGORIES.join(', ')}`),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

/**
 * Validation rules for submitting a found report
 */
const validateReportFound = [
  body('finderName')
    .trim()
    .notEmpty()
    .withMessage('Finder name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Finder name must be between 2 and 60 characters'),

  body('finderPhone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 digits'),

  body('finderEmail')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('finderMessage')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
];

module.exports = {
  validateCreateItem,
  validateReportFound,
};
