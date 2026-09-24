const Item = require('../models/Item');
const ApiError = require('../utils/ApiError');
const { generateUniqueTagId, generateQRCodeDataUrl } = require('../utils/tagGenerator');
const { ITEM_STATUS } = require('../config/constants');

/**
 * Item Controller
 * ───────────────
 * createItem   POST /api/v1/items
 * getMyItems   GET  /api/v1/items/my-items
 * getItemById  GET  /api/v1/items/:id
 */

// ── Register a New Item ──────────────────────────────────────────────────────
const createItem = async (req, res, next) => {
  try {
    const { itemName, category, description } = req.body;

    // 1. Generate unique, collision-safe Tag ID (TT-XXXXXX)
    const tagId = await generateUniqueTagId();

    // 2. Generate QR Code Data URL embedding the public lookup URL
    const qrCode = await generateQRCodeDataUrl(tagId);

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

module.exports = {
  createItem,
  getMyItems,
  getItemById,
};
