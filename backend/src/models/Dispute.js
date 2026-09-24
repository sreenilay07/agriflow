const mongoose = require('mongoose');
const { DISPUTE_STATUS } = require('../constants/status');

const disputeSchema = new mongoose.Schema(
  {
    disputeNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    referenceType: {
      type: String,
      enum: ['PRODUCE_LOT', 'QUALITY_INSPECTION', 'SETTLEMENT', 'PAYMENT', 'BOOKING'],
      required: true
    },
    referenceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      default: null,
      index: true
    },
    category: {
      type: String,
      enum: ['GRADE_DISPUTE', 'WEIGHT_DISCREPANCY', 'DEDUCTION_QUERY', 'PAYMENT_DELAY', 'REJECTION_APPEAL', 'OTHER'],
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Dispute title/reason is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Dispute description is required'],
      trim: true
    },
    evidenceUrls: [
      { type: String }
    ],
    status: {
      type: String,
      enum: Object.values(DISPUTE_STATUS),
      default: DISPUTE_STATUS.OPEN,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolution: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

disputeSchema.index({ raisedBy: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Dispute', disputeSchema);
