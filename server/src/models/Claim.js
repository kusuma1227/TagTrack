const mongoose = require('mongoose');
const { CLAIM_STATUS } = require('../config/constants');

const claimSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claim must have an owner'],
      index: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Claim must be linked to an item'],
      index: true,
    },
    foundReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundReport',
      required: [true, 'Claim must be linked to a found report'],
      index: true,
    },
    claimMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Claim message cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(CLAIM_STATUS),
        message: '{VALUE} is not a valid claim status',
      },
      default: CLAIM_STATUS.SUBMITTED,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
claimSchema.index({ item: 1, owner: 1, status: 1 });
claimSchema.index({ owner: 1, createdAt: -1 });

// ── Safe JSON Representation ────────────────────────────────────────────────
claimSchema.methods.toSafeJSON = function () {
  return {
    _id: this._id,
    owner: this.owner,
    item: this.item,
    foundReport: this.foundReport,
    claimMessage: this.claimMessage,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;
