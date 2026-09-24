const mongoose = require('mongoose');
const { SHIPMENT_STATUS } = require('../constants/status');

const shipmentTrackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    location: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    shipmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
      index: true
    },
    allocations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LotAllocation'
      }
    ],
    originWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true
    },
    destinationAddress: {
      facilityName: { type: String, trim: true, default: '' },
      street: { type: String, trim: true, default: '' },
      district: { type: String, trim: true, required: true },
      state: { type: String, trim: true, required: true },
      pincode: { type: String, trim: true, default: '' },
      contactPerson: { type: String, trim: true, default: '' },
      contactPhone: { type: String, trim: true, default: '' }
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    driverName: {
      type: String,
      required: true,
      trim: true
    },
    driverPhone: {
      type: String,
      required: true,
      trim: true
    },
    totalWeightKg: {
      type: Number,
      required: true,
      min: [1, 'Shipment weight must be at least 1 kg']
    },
    status: {
      type: String,
      enum: Object.values(SHIPMENT_STATUS),
      default: SHIPMENT_STATUS.PLANNED,
      index: true
    },
    plannedDispatchDate: {
      type: Date,
      default: Date.now
    },
    actualDispatchDate: {
      type: Date
    },
    estimatedArrivalDate: {
      type: Date
    },
    actualDeliveryDate: {
      type: Date
    },
    manifest: {
      goodsDescription: { type: String, default: 'Agricultural Bulk Produce' },
      lotNumbers: [{ type: String }],
      totalBags: { type: Number, default: 0 },
      sealNumber: { type: String, default: '' },
      weighbridgeSlipNumber: { type: String, default: '' }
    },
    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      default: ''
    },
    trackingEvents: [shipmentTrackingEventSchema]
  },
  {
    timestamps: true
  }
);

shipmentSchema.index({ shipmentNumber: 1, purchaseOrder: 1, status: 1 });

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
