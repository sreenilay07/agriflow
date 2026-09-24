const mongoose = require('mongoose');
const { INVENTORY_MOVEMENT_TYPE } = require('../constants/status');

const inventoryMovementSchema = new mongoose.Schema(
  {
    movementNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    movementType: {
      type: String,
      enum: Object.values(INVENTORY_MOVEMENT_TYPE),
      required: true,
      index: true
    },
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      default: null,
      index: true
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      default: null,
      index: true
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true
    },
    destinationWarehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.01, 'Quantity must be positive']
    },
    unit: {
      type: String,
      default: 'KG'
    },
    source: {
      type: String,
      default: 'Collection Centre'
    },
    destination: {
      type: String,
      default: 'Warehouse Storage'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      default: ''
    },
    referenceId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

inventoryMovementSchema.index({ warehouseId: 1, createdAt: -1 });
inventoryMovementSchema.index({ lotId: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema);
