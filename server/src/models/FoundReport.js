const mongoose = require('mongoose');
const { REPORT_STATUS } = require('../config/constants');

const foundReportSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Found report must be linked to an item'],
      index: true,
    },
    finderName: {
      type: String,
      required: [true, 'Finder name is required'],
      trim: true,
      minlength: [2, 'Finder name must be at least 2 characters'],
      maxlength: [60, 'Finder name cannot exceed 60 characters'],
    },
    finderPhone: {
      type: String,
      required: [true, 'Finder phone number is required'],
      trim: true,
      minlength: [7, 'Phone number must be at least 7 digits'],
      maxlength: [20, 'Phone number cannot exceed 20 digits'],
    },
    finderEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    finderMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(REPORT_STATUS),
        message: '{VALUE} is not a valid report status',
      },
      default: REPORT_STATUS.SUBMITTED,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
foundReportSchema.index({ item: 1, status: 1 });
foundReportSchema.index({ item: 1, finderPhone: 1 });

// ── Public Safe Representation ───────────────────────────────────────────────
foundReportSchema.methods.toSafeJSON = function () {
  return {
    _id: this._id,
    item: this.item,
    finderName: this.finderName,
    finderPhone: this.finderPhone,
    finderEmail: this.finderEmail,
    finderMessage: this.finderMessage,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const FoundReport = mongoose.model('FoundReport', foundReportSchema);
module.exports = FoundReport;
