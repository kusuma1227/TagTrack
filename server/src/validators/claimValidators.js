const { body, param } = require('express-validator');
const { CLAIM_STATUS } = require('../config/constants');

const allowedReviewStatuses = [
  CLAIM_STATUS.APPROVED,
  CLAIM_STATUS.REJECTED,
  CLAIM_STATUS.UNDER_REVIEW,
];

/**
 * Validation rules for updating claim status (Officer Review)
 */
const validateUpdateClaimStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Claim ID format'),

  body('status')
    .trim()
    .notEmpty()
    .withMessage('Claim status is required')
    .isIn(allowedReviewStatuses)
    .withMessage(`Status must be one of: ${allowedReviewStatuses.join(', ')}`),

  body('rejectionReason')
    .if(body('status').equals(CLAIM_STATUS.REJECTED))
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting a claim')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Rejection reason must be between 3 and 1000 characters'),

  body('verificationNotes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Verification notes cannot exceed 1000 characters'),
];

module.exports = {
  validateUpdateClaimStatus,
};
