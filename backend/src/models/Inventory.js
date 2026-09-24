const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
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
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      required: true,
      unique: true,
      index: true
    },
    batchNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    grade: {
      type: String,
      enum: ['GRADE_A', 'GRADE_B', 'GRADE_C'],
      default: 'GRADE_A'
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [0, 'Total quantity cannot be negative']
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative']
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    },
    unit: {
      type: String,
      enum: ['KG', 'QUINTAL', 'TONNE'],
      default: 'KG'
    },
    status: {
      type: String,
      enum: ['IN_STOCK', 'RESERVED', 'ALLOCATED', 'DISPATCHED', 'DEPLETED'],
      default: 'IN_STOCK',
      index: true
    },
    storageLocation: {
      type: String,
      default: 'Bay-A1',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

inventorySchema.index({ warehouseId: 1, cropId: 1, status: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
