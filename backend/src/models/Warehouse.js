const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Warehouse code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcurementCentre',
      default: null,
      index: true
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      default: null,
      index: true
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      default: null,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    address: {
      type: String,
      default: ''
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    totalCapacityKg: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Capacity must be greater than 0']
    },
    usedCapacityKg: {
      type: Number,
      default: 0,
      min: [0, 'Used capacity cannot be negative']
    },
    temperatureControlled: {
      type: Boolean,
      default: false
    },
    supportedCrops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
      }
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'FULL', 'MAINTENANCE'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

warehouseSchema.index({ centreId: 1, status: 1 });
warehouseSchema.index({ districtId: 1, status: 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema);
