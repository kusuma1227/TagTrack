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

module.exports = {
  validateCreateItem,
};
