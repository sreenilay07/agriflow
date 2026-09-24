const mongoose = require('mongoose');
const { PRODUCE_LOT_STATUS } = require('../constants/status');

const lifecycleStepSchema = new mongoose.Schema(
  {
    fromStatus: { type: String, default: null },
    toStatus: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reason: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const produceLotSchema = new mongoose.Schema(
  {
    lotNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true
    },
    harvestDate: {
      type: Date,
      default: Date.now
    },
    declaredQuantity: {
      type: Number,
      required: [true, 'Declared quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    agreedPricePerKg: {
      type: Number,
      default: null,
      min: [0, 'Agreed price cannot be negative']
    },
    receivedQuantity: {
      type: Number,
      default: null
    },
    acceptedQuantity: {
      type: Number,
      default: 0
    },
    rejectedQuantity: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      enum: ['KG', 'QUINTAL', 'TONNE'],
      default: 'KG'
    },
    collectionCentreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcurementCentre',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(PRODUCE_LOT_STATUS),
      default: PRODUCE_LOT_STATUS.CREATED,
      index: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true
    },
    tokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      default: null
    },
    qualityInspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QualityInspection',
      default: null
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null
    },
    procurementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Procurement',
      default: null
    },
    settlementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Settlement',
      default: null
    },
    receivedAt: {
      type: Date,
      default: null
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    receivingNotes: {
      type: String,
      default: ''
    },
    lifecycleHistory: [lifecycleStepSchema]
  },
  {
    timestamps: true
  }
);

produceLotSchema.index({ farmerId: 1, status: 1, createdAt: -1 });
produceLotSchema.index({ collectionCentreId: 1, status: 1 });

module.exports = mongoose.model('ProduceLot', produceLotSchema);
