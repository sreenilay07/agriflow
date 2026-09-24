const mongoose = require('mongoose');
const { BUYER_VERIFICATION_STATUS } = require('../constants/status');

const buyerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    businessName: {
      type: String,
      trim: true,
      default: ''
    },
    businessType: {
      type: String,
      enum: ['PROCESSING_MILL', 'EXPORTER', 'WHOLESALER', 'RETAIL_CHAIN', 'AGRI_TECH', 'INSTITUTIONAL_BUYER', 'OTHER'],
      default: 'WHOLESALER'
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    contactPerson: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      trim: true,
      default: ''
    },
    operatingRegions: [
      {
        type: String,
        trim: true
      }
    ],
    preferredCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
      }
    ],
    verificationStatus: {
      type: String,
      enum: Object.values(BUYER_VERIFICATION_STATUS),
      default: BUYER_VERIFICATION_STATUS.PENDING,
      index: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    activeStatus: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

buyerProfileSchema.index({ organizationName: 'text', businessName: 'text', district: 1, state: 1 });

const BuyerProfile = mongoose.model('BuyerProfile', buyerProfileSchema);

module.exports = BuyerProfile;
