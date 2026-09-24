const mongoose = require('mongoose');
const { DELIVERY_CONDITION } = require('../constants/status');

const deliveryConfirmationSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      unique: true,
      index: true
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
      index: true
    },
    dispatchedQuantityKg: {
      type: Number,
      required: true,
      min: 0
    },
    deliveredQuantityKg: {
      type: Number,
      required: true,
      min: 0
    },
    discrepancyKg: {
      type: Number,
      default: 0
    },
    discrepancyReason: {
      type: String,
      default: ''
    },
    condition: {
      type: String,
      enum: Object.values(DELIVERY_CONDITION),
      default: DELIVERY_CONDITION.EXCELLENT
    },
    receiverName: {
      type: String,
      required: [true, 'Receiver name is required'],
      trim: true
    },
    receiverPhone: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    confirmedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

deliveryConfirmationSchema.index({ shipment: 1, purchaseOrder: 1 });

const DeliveryConfirmation = mongoose.model('DeliveryConfirmation', deliveryConfirmationSchema);

module.exports = DeliveryConfirmation;
