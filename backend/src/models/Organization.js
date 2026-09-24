const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      index: true
    },
    code: {
      type: String,
      required: [true, 'Organization code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'PROCUREMENT_NETWORK',
        'BUYER_ORGANIZATION',
        'WAREHOUSE_OPERATOR',
        'LOGISTICS_PROVIDER',
        'GOVERNMENT_AGENCY',
        'OTHER'
      ],
      default: 'PROCUREMENT_NETWORK',
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      district: String,
      state: String,
      pincode: String
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      default: null,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Organization', organizationSchema);
