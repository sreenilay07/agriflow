const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Region name is required'],
      trim: true,
      index: true
    },
    code: {
      type: String,
      required: [true, 'Region code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Region', regionSchema);
