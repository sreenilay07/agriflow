const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    farmerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      default: null
    },
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true
    },
    village: {
      type: String,
      default: '',
      trim: true
    },
    mandal: {
      type: String,
      default: '',
      trim: true
    },
    district: {
      type: String,
      default: '',
      trim: true
    },
    state: {
      type: String,
      default: 'Telangana',
      trim: true
    },
    pincode: {
      type: String,
      default: '',
      trim: true
    },
    surveyNumber: {
      type: String,
      default: '',
      trim: true
    },
    acreage: {
      type: Number,
      required: [true, 'Acreage is required'],
      min: [0.1, 'Acreage must be at least 0.1 acres']
    },
    ownershipType: {
      type: String,
      enum: ['OWNED', 'LEASED', 'TENANT'],
      default: 'OWNED'
    },
    soilType: {
      type: String,
      default: 'Black Soil',
      trim: true
    },
    irrigationSource: {
      type: String,
      enum: ['BOREWELL', 'CANAL', 'RAIN_FED', 'DRIP_IRRIGATION', 'OTHER'],
      default: 'BOREWELL'
    },
    cropsGrown: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
      }
    ],
    location: {
      latitude: { type: Number, default: 17.385043 },
      longitude: { type: Number, default: 78.486671 }
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

farmSchema.index({ farmerId: 1, status: 1 });

module.exports = mongoose.model('Farm', farmSchema);
