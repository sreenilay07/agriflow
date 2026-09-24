const mongoose = require('mongoose');
const { LOT_ALLOCATION_STATUS } = require('../constants/status');

const lotAllocationSchema = new mongoose.Schema(
  {
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
      index: true
    },
    purchaseOrderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    produceLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      required: true,
      index: true
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    allocatedQuantityKg: {
      type: Number,
      required: true,
      min: [1, 'Allocated quantity must be at least 1 kg']
    },
    unitPricePerKg: {
      type: Number,
      required: true,
      min: 0.01
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(LOT_ALLOCATION_STATUS),
      default: LOT_ALLOCATION_STATUS.ALLOCATED,
      index: true
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    allocatedAt: {
      type: Date,
      default: Date.now
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

lotAllocationSchema.index({ purchaseOrder: 1, produceLot: 1, status: 1 });

const LotAllocation = mongoose.model('LotAllocation', lotAllocationSchema);

module.exports = LotAllocation;
