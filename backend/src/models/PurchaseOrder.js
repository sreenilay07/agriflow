const mongoose = require('mongoose');
const { PURCHASE_ORDER_STATUS, QUALITY_GRADE } = require('../constants/status');

const purchaseOrderItemSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true
    },
    requestedGrade: {
      type: String,
      enum: Object.values(QUALITY_GRADE),
      default: QUALITY_GRADE.GRADE_A
    },
    requestedQuantityKg: {
      type: Number,
      required: true,
      min: [1, 'Requested quantity must be at least 1 kg']
    },
    agreedUnitPricePerKg: {
      type: Number,
      required: true,
      min: [0.01, 'Unit price must be positive']
    },
    allocatedQuantityKg: {
      type: Number,
      default: 0,
      min: 0
    },
    dispatchedQuantityKg: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveredQuantityKg: {
      type: Number,
      default: 0,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: true }
);

const poLifecycleEventSchema = new mongoose.Schema(
  {
    fromStatus: {
      type: String,
      required: true
    },
    toStatus: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    buyerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BuyerProfile',
      required: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(PURCHASE_ORDER_STATUS),
      default: PURCHASE_ORDER_STATUS.SUBMITTED,
      index: true
    },
    items: [purchaseOrderItemSchema],
    totalQuantityKg: {
      type: Number,
      required: true,
      min: 1
    },
    allocatedQuantityKg: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveredQuantityKg: {
      type: Number,
      default: 0,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0
    },
    requestedDeliveryDate: {
      type: Date,
      required: true
    },
    deliveryAddress: {
      facilityName: { type: String, trim: true, default: '' },
      street: { type: String, trim: true, default: '' },
      district: { type: String, trim: true, required: true },
      state: { type: String, trim: true, required: true },
      pincode: { type: String, trim: true, default: '' },
      contactPerson: { type: String, trim: true, default: '' },
      contactPhone: { type: String, trim: true, default: '' }
    },
    notes: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    lifecycleHistory: [poLifecycleEventSchema]
  },
  {
    timestamps: true
  }
);

purchaseOrderSchema.index({ poNumber: 1, buyer: 1, status: 1, createdAt: -1 });

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
