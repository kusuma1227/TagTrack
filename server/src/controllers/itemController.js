const Item = require('../models/Item');
const FoundReport = require('../models/FoundReport');
const Claim = require('../models/Claim');
const ApiError = require('../utils/ApiError');
const { generateUniqueTagId, generateQRCodeDataUrl } = require('../utils/tagGenerator');
const { ITEM_STATUS, REPORT_STATUS, CLAIM_STATUS } = require('../config/constants');

/**
 * Item Controller
 * ───────────────
 * getItemByTagId      GET   /api/v1/items/tag/:tagId (Public)
 * reportItemFound     POST  /api/v1/items/:tagId/found (Public)
 * createItem          POST  /api/v1/items (Private)
 * getMyItems          GET   /api/v1/items/my-items (Private)
 * getItemById         GET   /api/v1/items/:id (Private)
 * markItemLost        PATCH /api/v1/items/:id/lost (Private)
 * getMyFoundReports   GET   /api/v1/items/found-reports (Private)
 * submitOwnershipClaim POST /api/v1/items/:tagId/claims (Private)
 * getMyClaims         GET   /api/v1/items/my-claims (Private)
 */

// ── Get Public Item Details by Tag ID (Public) ───────────────────────────────
const getItemByTagId = async (req, res, next) => {
  try {
    const rawTagId = req.params.tagId;
    if (!rawTagId) {
      throw new ApiError(400, 'Tag ID is required', 'TAG_ID_REQUIRED');
    }

    const tagId = rawTagId.trim().toUpperCase();
    if (!/^TT-[A-Z0-9]{6}$/.test(tagId)) {
      throw new ApiError(400, 'Invalid Tag ID format. Must be in format TT-XXXXXX', 'INVALID_TAG_ID');
    }

    const item = await Item.findOne({ tagId });
    if (!item) {
      throw new ApiError(404, 'No item found with this Tag ID', 'ITEM_NOT_FOUND');
    }

    return res.json({
      success: true,
      message: 'Item details retrieved successfully',
      data: {
        item: item.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Report Found for a LOST Item (Public) ────────────────────────────────────
const reportItemFound = async (req, res, next) => {
  try {
    const rawTagId = req.params.tagId;
    if (!rawTagId) {
      throw new ApiError(400, 'Tag ID is required', 'TAG_ID_REQUIRED');
    }

    const tagId = rawTagId.trim().toUpperCase();
    if (!/^TT-[A-Z0-9]{6}$/.test(tagId)) {
      throw new ApiError(400, 'Invalid Tag ID format. Must be in format TT-XXXXXX', 'INVALID_TAG_ID');
    }

    const item = await Item.findOne({ tagId });
    if (!item) {
      throw new ApiError(404, 'No item found with this Tag ID', 'ITEM_NOT_FOUND');
    }

    // Check item status
    if (item.status === ITEM_STATUS.REGISTERED) {
      throw new ApiError(
        400,
        'This item is registered and has not been reported lost by its owner.',
        'ITEM_NOT_LOST'
      );
    }

    if (item.status === ITEM_STATUS.RETURNED) {
      throw new ApiError(
        400,
        'This item has already been marked as returned.',
        'ITEM_ALREADY_RETURNED'
      );
    }

    if (item.status !== ITEM_STATUS.LOST) {
      throw new ApiError(
        400,
        `Cannot report found for an item with status ${item.status}`,
        'INVALID_STATUS'
      );
    }

    const { finderName, finderPhone, finderEmail, finderMessage } = req.body;

    // Prevent duplicate active report from the same finder phone
    const existingReport = await FoundReport.findOne({
      item: item._id,
      finderPhone: finderPhone.trim(),
      status: REPORT_STATUS.SUBMITTED,
    });

    if (existingReport) {
      throw new ApiError(
        400,
        'A found report with this contact number has already been submitted for this item.',
        'DUPLICATE_REPORT'
      );
    }

    // Create the FoundReport in MongoDB (item status remains LOST)
    const report = await FoundReport.create({
      item: item._id,
      finderName: finderName.trim(),
      finderPhone: finderPhone.trim(),
      finderEmail: finderEmail ? finderEmail.trim().toLowerCase() : null,
      finderMessage: finderMessage ? finderMessage.trim() : '',
      status: REPORT_STATUS.SUBMITTED,
    });

    return res.status(201).json({
      success: true,
      message: 'Found report submitted successfully. Thank you for helping recover this item!',
      data: {
        report: report.toSafeJSON(),
        item: item.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Register a New Item ──────────────────────────────────────────────────────
const createItem = async (req, res, next) => {
  try {
    const { itemName, category, description } = req.body;

    // 1. Generate unique, collision-safe Tag ID (TT-XXXXXX)
    const tagId = await generateUniqueTagId();

    // 2. Generate QR Code Data URL embedding the public lookup URL
    const origin = req.headers.origin || req.headers.referer || null;
    const qrCode = await generateQRCodeDataUrl(tagId, origin);

    // 3. Save Item in MongoDB
    const item = await Item.create({
      itemName,
      category,
      description: description || '',
      tagId,
      qrCode,
      status: ITEM_STATUS.REGISTERED,
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Item registered successfully',
      data: {
        item: {
          _id: item._id,
          itemName: item.itemName,
          category: item.category,
          description: item.description,
          tagId: item.tagId,
          qrCode: item.qrCode,
          status: item.status,
          owner: item.owner,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Logged-in Owner's Registered Items ────────────────────────────────────
const getMyItems = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;

    // Strict filter: only items belonging to the authenticated user
    const query = { owner: req.user._id };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { itemName: { $regex: search.trim(), $options: 'i' } },
        { tagId: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const items = await Item.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      message: 'Items retrieved successfully',
      data: {
        items,
        count: items.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Item By ID ────────────────────────────────────────────────────────────
const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      throw new ApiError(404, 'Item not found', 'ITEM_NOT_FOUND');
    }

    // Access control: only the owner or an admin can access full item details
    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'Access denied. You do not own this item.', 'FORBIDDEN');
    }

    return res.json({
      success: true,
      message: 'Item retrieved successfully',
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Mark Item as LOST ────────────────────────────────────────────────────────
const markItemLost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      throw new ApiError(404, 'Item not found', 'ITEM_NOT_FOUND');
    }

    // Access control: only the authenticated owner can mark their item as lost
    if (item.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access denied. You do not own this item.', 'FORBIDDEN');
    }

    // Specific status transition checks
    if (item.status === ITEM_STATUS.LOST) {
      throw new ApiError(400, 'Item is already marked as lost', 'ITEM_ALREADY_LOST');
    }

    if (item.status === ITEM_STATUS.RETURNED) {
      throw new ApiError(400, 'Returned items cannot be marked as lost', 'INVALID_STATUS_TRANSITION');
    }

    if (item.status !== ITEM_STATUS.REGISTERED) {
      throw new ApiError(
        400,
        `Cannot mark item as lost. Current status is ${item.status}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Update status to LOST
    item.status = ITEM_STATUS.LOST;
    await item.save();

    return res.json({
      success: true,
      message: 'Item marked as lost successfully',
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Found Reports for Logged-in Owner ────────────────────────────────────
const getMyFoundReports = async (req, res, next) => {
  try {
    // 1. Fetch all items owned by the authenticated user
    const ownerItems = await Item.find({ owner: req.user._id }).select('_id');
    const ownerItemIds = ownerItems.map((item) => item._id);

    if (ownerItemIds.length === 0) {
      return res.json({
        success: true,
        message: 'Found reports retrieved successfully',
        data: {
          reports: [],
          count: 0,
        },
      });
    }

    // 2. Fetch all found reports for these items with item details populated
    const reports = await FoundReport.find({ item: { $in: ownerItemIds } })
      .populate('item', 'itemName tagId status category description')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      message: 'Found reports retrieved successfully',
      data: {
        reports,
        count: reports.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Submit Ownership Claim (Private - Owner) ─────────────────────────────────
const submitOwnershipClaim = async (req, res, next) => {
  try {
    const rawTagId = req.params.tagId;
    if (!rawTagId) {
      throw new ApiError(400, 'Tag ID is required', 'TAG_ID_REQUIRED');
    }

    const tagId = rawTagId.trim().toUpperCase();
    if (!/^TT-[A-Z0-9]{6}$/.test(tagId)) {
      throw new ApiError(400, 'Invalid Tag ID format. Must be in format TT-XXXXXX', 'INVALID_TAG_ID');
    }

    // 1. Verify that the item exists
    const item = await Item.findOne({ tagId });
    if (!item) {
      throw new ApiError(404, 'No item found with this Tag ID', 'ITEM_NOT_FOUND');
    }

    // 2. Ensure only the legitimate owner can create a claim
    if (item.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access denied. You do not own this item.', 'FORBIDDEN');
    }

    // 3. Find relevant Found Report for this item
    const { foundReportId, claimMessage } = req.body;
    let foundReport = null;

    if (foundReportId) {
      foundReport = await FoundReport.findOne({ _id: foundReportId, item: item._id });
      if (!foundReport) {
        throw new ApiError(404, 'Found report not found for this item', 'FOUND_REPORT_NOT_FOUND');
      }
    } else {
      // Find the most recent found report for this item
      foundReport = await FoundReport.findOne({ item: item._id }).sort({ createdAt: -1 });
      if (!foundReport) {
        throw new ApiError(400, 'Cannot submit claim. No found report exists for this item.', 'NO_FOUND_REPORT');
      }
    }

    // 4. Prevent duplicate active claims for the same item by the same owner
    const existingActiveClaim = await Claim.findOne({
      item: item._id,
      owner: req.user._id,
      status: { $in: [CLAIM_STATUS.SUBMITTED, CLAIM_STATUS.PENDING, CLAIM_STATUS.UNDER_REVIEW, CLAIM_STATUS.APPROVED] },
    });

    if (existingActiveClaim) {
      throw new ApiError(
        400,
        'An active ownership claim has already been submitted for this item.',
        'DUPLICATE_CLAIM'
      );
    }

    // 5. Create Claim in MongoDB
    const claim = await Claim.create({
      owner: req.user._id,
      item: item._id,
      foundReport: foundReport._id,
      claimMessage: claimMessage ? claimMessage.trim() : '',
      status: CLAIM_STATUS.SUBMITTED,
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate('item', 'itemName tagId status category description')
      .populate('foundReport', 'finderName finderPhone finderEmail finderMessage createdAt');

    return res.status(201).json({
      success: true,
      message: 'Ownership claim submitted successfully',
      data: {
        claim: populatedClaim,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Logged-in Owner's Claims (Private) ───────────────────────────────────
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ owner: req.user._id })
      .populate('item', 'itemName tagId status category description')
      .populate('foundReport', 'finderName finderPhone finderEmail finderMessage createdAt')
      .sort({ createdAt: -1 });

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

module.exports = {
  getItemByTagId,
  reportItemFound,
  createItem,
  getMyItems,
  getItemById,
  markItemLost,
  getMyFoundReports,
  submitOwnershipClaim,
  getMyClaims,
};
