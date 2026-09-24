const mongoose = require('mongoose');

const qualityParameterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    unit: { type: String, default: '%' },
    minValue: { type: Number, default: 0 },
    maxValue: { type: Number, default: 100 },
    optimalValue: { type: Number, default: null },
    weightage: { type: Number, default: 1 },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const gradingRuleSchema = new mongoose.Schema(
  {
    grade: {
      type: String,
      enum: ['GRADE_A', 'GRADE_B', 'GRADE_C', 'REJECTED'],
      required: true
    },
    minScore: { type: Number, default: 0 },
    maxMoisture: { type: Number, default: 14 },
    maxForeignMatter: { type: Number, default: 2 },
    maxBrokenGrains: { type: Number, default: 5 },
    priceMultiplier: { type: Number, default: 1.0 }
  },
  { _id: false }
);

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Crop code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['CEREAL', 'PULSE', 'OILSEED', 'CASH_CROP', 'VEGETABLE', 'SPICE', 'OTHER'],
      default: 'CEREAL'
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceCategory',
      default: null,
      index: true
    },
    season: {
      type: String,
      enum: ['KHARIF', 'RABI', 'ZAID', 'ALL_SEASON'],
      default: 'ALL_SEASON'
    },
    basePricePerKg: {
      type: Number,
      default: 25,
      min: [0, 'Base price must be positive']
    },
    localNames: {
      en: { type: String, required: true },
      te: { type: String, required: true },
      hi: { type: String, required: true }
    },
    unit: {
      type: String,
      enum: ['KG', 'QUINTAL', 'TONNE'],
      default: 'KG'
    },
    defaultProcessingCapacity: {
      type: Number,
      default: 2000 // kg per hour per counter
    },
    requiredDocuments: [
      { type: String }
    ],
    qualityParameters: [qualityParameterSchema],
    standardGradingRules: [gradingRuleSchema],
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

module.exports = mongoose.model('Crop', cropSchema);
