const mongoose = require('mongoose');
const { VEHICLE_STATUS } = require('../constants/status');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['MINI_TRUCK_3T', 'MEDIUM_TRUCK_7T', 'HEAVY_TRUCK_10T', 'MULTI_AXLE_16T', 'TRAILER_25T', 'CONTAINER_TRUCK'],
      default: 'HEAVY_TRUCK_10T'
    },
    capacityKg: {
      type: Number,
      required: [true, 'Vehicle capacity in kg is required'],
      min: [100, 'Capacity must be at least 100 kg']
    },
    transporterName: {
      type: String,
      trim: true,
      default: ''
    },
    driverName: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true
    },
    driverPhone: {
      type: String,
      required: [true, 'Driver phone number is required'],
      trim: true
    },
    driverLicenseNumber: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(VEHICLE_STATUS),
      default: VEHICLE_STATUS.ACTIVE,
      index: true
    },
    currentShipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      default: null
    },
    currentLocation: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

vehicleSchema.index({ vehicleNumber: 1, status: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
