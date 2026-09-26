/**
 * Shared application constants.
 * Single source of truth for enums used across models, controllers, and middleware.
 */

const ROLES = {
  OWNER: 'owner',
  FINDER: 'finder',
  OFFICER: 'officer',
  ADMIN: 'admin',
};

const ITEM_STATUS = {
  REGISTERED: 'REGISTERED',
  LOST: 'LOST',
  FOUND: 'FOUND',
  RETURNED: 'RETURNED',
  DEACTIVATED: 'DEACTIVATED',
};

const CLAIM_STATUS = {
  SUBMITTED: 'SUBMITTED',
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const REPORT_STATUS = {
  SUBMITTED: 'SUBMITTED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
};

const HANDOVER_METHOD = {
  IN_PERSON: 'IN_PERSON',
  COURIER: 'COURIER',
  DROP_POINT: 'DROP_POINT',
};

const NOTIFICATION_TYPES = {
  ITEM_FOUND: 'ITEM_FOUND',
  CLAIM_SUBMITTED: 'CLAIM_SUBMITTED',
  CLAIM_APPROVED: 'CLAIM_APPROVED',
  CLAIM_REJECTED: 'CLAIM_REJECTED',
  EVIDENCE_REQUESTED: 'EVIDENCE_REQUESTED',
  HANDOVER_RECORDED: 'HANDOVER_RECORDED',
  ITEM_RETURNED: 'ITEM_RETURNED',
};

const ITEM_CATEGORIES = [
  'Electronics',
  'Bags & Luggage',
  'Jewelry & Accessories',
  'Documents & Cards',
  'Keys',
  'Clothing',
  'Sports Equipment',
  'Musical Instruments',
  'Books & Stationery',
  'Pets & Pet Items',
  'Vehicles & Parts',
  'Other',
];

module.exports = {
  ROLES,
  ITEM_STATUS,
  CLAIM_STATUS,
  REPORT_STATUS,
  HANDOVER_METHOD,
  NOTIFICATION_TYPES,
  ITEM_CATEGORIES,
};
