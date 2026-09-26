const Claim = require('../models/Claim');
const ApiError = require('../utils/ApiError');
const { CLAIM_STATUS } = require('../config/constants');

/**
 * Claim Controller — Verification Officer Operations
 * ──────────────────────────────────────────────────
 * getClaims         GET   /api/v1/claims (Private: Officer, Admin)
 * getClaimById      GET   /api/v1/claims/:id (Private: Officer, Admin)
 * updateClaimStatus PUT   /api/v1/claims/:id/status (Private: Officer, Admin)
 */

// ── Get All Claims for Verification Officer ──────────────────────────────────
const getClaims = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && Object.values(CLAIM_STATUS).includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    let claims = await Claim.find(query)
      .populate('item', 'itemName tagId category status description')
      .populate('foundReport', 'finderName finderPhone finderEmail finderMessage createdAt')
      .populate('owner', 'name email phone')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    // In-memory filter for search if provided (covers populated fields)
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      claims = claims.filter((claim) => {
        const itemName = claim.item?.itemName?.toLowerCase() || '';
        const tagId = claim.item?.tagId?.toLowerCase() || '';
        const ownerName = claim.owner?.name?.toLowerCase() || '';
        const ownerEmail = claim.owner?.email?.toLowerCase() || '';
        const finderName = claim.foundReport?.finderName?.toLowerCase() || '';
        const message = claim.claimMessage?.toLowerCase() || '';

        return (
          itemName.includes(term) ||
          tagId.includes(term) ||
          ownerName.includes(term) ||
          ownerEmail.includes(term) ||
          finderName.includes(term) ||
          message.includes(term)
        );
      });
    }

    return res.json({
      success: true,
      message: 'Claims retrieved successfully',
      data: {
        claims,
        count: claims.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Claim By ID ──────────────────────────────────────────────────────────
const getClaimById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const claim = await Claim.findById(id)
      .populate('item', 'itemName tagId category status description')
      .populate('foundReport', 'finderName finderPhone finderEmail finderMessage createdAt')
      .populate('owner', 'name email phone')
      .populate('reviewedBy', 'name email role');

    if (!claim) {
      throw new ApiError(404, 'Claim not found', 'CLAIM_NOT_FOUND');
    }

    return res.json({
      success: true,
      message: 'Claim retrieved successfully',
      data: {
        claim,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Update Claim Status (Approve / Reject / Under Review) ─────────────────────
const updateClaimStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, verificationNotes } = req.body;

    const claim = await Claim.findById(id);
    if (!claim) {
      throw new ApiError(404, 'Claim not found', 'CLAIM_NOT_FOUND');
    }

    const targetStatus = status.trim().toUpperCase();

    // Prevent invalid status transitions for finalized claims
    if (claim.status === CLAIM_STATUS.APPROVED) {
      throw new ApiError(
        400,
        'This claim has already been approved and cannot be modified.',
        'INVALID_STATUS_TRANSITION'
      );
    }

    if (claim.status === CLAIM_STATUS.REJECTED) {
      throw new ApiError(
        400,
        'This claim has already been rejected and cannot be modified.',
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Additional check when rejecting
    if (targetStatus === CLAIM_STATUS.REJECTED && (!rejectionReason || !rejectionReason.trim())) {
      throw new ApiError(
        400,
        'Rejection reason is required when rejecting an ownership claim.',
        'REJECTION_REASON_REQUIRED'
      );
    }

    // Apply updates
    claim.status = targetStatus;
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();

    if (targetStatus === CLAIM_STATUS.REJECTED) {
      claim.rejectionReason = rejectionReason ? rejectionReason.trim() : '';
    } else {
      claim.rejectionReason = '';
    }

    if (verificationNotes !== undefined) {
      claim.verificationNotes = verificationNotes ? verificationNotes.trim() : '';
    }

    await claim.save();

    const updatedClaim = await Claim.findById(claim._id)
      .populate('item', 'itemName tagId category status description')
      .populate('foundReport', 'finderName finderPhone finderEmail finderMessage createdAt')
      .populate('owner', 'name email phone')
      .populate('reviewedBy', 'name email role');

    return res.json({
      success: true,
      message: `Ownership claim status successfully updated to ${targetStatus}`,
      data: {
        claim: updatedClaim,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClaims,
  getClaimById,
  updateClaimStatus,
};
