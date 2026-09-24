const mongoose = require('mongoose');
const { QUALITY_INSPECTION_STATUS, QUALITY_GRADE } = require('../constants/status');

const inspectionParameterSchema = new mongoose.Schema(
  {
    parameterCode: { type: String, required: true },
    parameterName: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, default: '%' },
    passed: { type: Boolean, default: true },
    remarks: { type: String, default: '' }
  },
  { _id: false }
);

const qualityInspectionSchema = new mongoose.Schema(
  {
    inspectionNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      required: true,
      index: true
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true
    },
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    inspectionDate: {
      type: Date,
      default: Date.now
    },
    parameters: [inspectionParameterSchema],
    moisturePercentage: {
      type: Number,
      default: 0
    },
    foreignMatterPercentage: {
      type: Number,
      default: 0
    },
    brokenGrainPercentage: {
      type: Number,
      default: 0
    },
    damagePercentage: {
      type: Number,
      default: 0
    },
    assignedGrade: {
      type: String,
      enum: Object.values(QUALITY_GRADE),
      required: true,
      index: true
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    declaredQuantity: {
      type: Number,
      default: 0
    },
    receivedQuantity: {
      type: Number,
      required: true
    },
    acceptedQuantity: {
      type: Number,
      required: true,
      min: [0, 'Accepted quantity cannot be negative']
    },
    rejectedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Rejected quantity cannot be negative']
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    },
    evidencePhotos: [
      { type: String }
    ],
    status: {
      type: String,
      enum: Object.values(QUALITY_INSPECTION_STATUS),
      default: QUALITY_INSPECTION_STATUS.COMPLETED,
      index: true
    },
    isReinspection: {
      type: Boolean,
      default: false
    },
    previousInspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QualityInspection',
      default: null
    }
  },
  {
    timestamps: true
  }
);

qualityInspectionSchema.index({ lotId: 1, createdAt: -1 });

module.exports = mongoose.model('QualityInspection', qualityInspectionSchema);
