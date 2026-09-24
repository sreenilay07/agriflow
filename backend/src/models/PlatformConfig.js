const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      enum: ['QUALITY', 'WAREHOUSE', 'SETTLEMENT', 'PROCUREMENT', 'NOTIFICATION'],
      required: true,
      index: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
