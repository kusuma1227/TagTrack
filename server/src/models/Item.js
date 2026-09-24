const mongoose = require('mongoose');
const { ITEM_STATUS, ITEM_CATEGORIES } = require('../config/constants');

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [2, 'Item name must be at least 2 characters'],
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ITEM_CATEGORIES,
        message: '{VALUE} is not a valid item category',
      },
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    tagId: {
      type: String,
      required: [true, 'Tag ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^TT-[A-Z0-9]{6}$/, 'Tag ID must be in the format TT-XXXXXX'],
    },
    qrCode: {
      type: String,
      required: [true, 'QR Code is required'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ITEM_STATUS),
        message: '{VALUE} is not a valid item status',
      },
      default: ITEM_STATUS.REGISTERED,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item must have an owner'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
itemSchema.index({ owner: 1, createdAt: -1 });
itemSchema.index({ status: 1 });

// ── Public JSON representation (never exposes owner private info) ────────────
itemSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    itemName: this.itemName,
    category: this.category,
    description: this.description,
    tagId: this.tagId,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
