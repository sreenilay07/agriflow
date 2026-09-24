const mongoose = require('mongoose');
const { PAYMENT_STATUS, SETTLEMENT_STATUS } = require('../constants/status');

const deductionSchema = new mongoose.Schema(
  {
    deductionType: {
      type: String,
      required: true,
      enum: ['MOISTURE_PENALTY', 'FOREIGN_MATTER_PENALTY', 'BAG_COST', 'HANDLING_CHARGES', 'TRANSPORT_LEVY', 'OTHER']
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Deduction amount cannot be negative']
    },
    description: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const adjustmentSchema = new mongoose.Schema(
  {
    adjustmentType: {
      type: String,
      required: true,
      enum: ['PREMIUM_GRADE_BONUS', 'INCENTIVE', 'SUBSIDY', 'ROUNDING_ADJUSTMENT', 'OTHER']
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Adjustment amount cannot be negative']
    },
    description: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const settlementSchema = new mongoose.Schema(
  {
    settlementNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      required: true,
      index: true
    },
    procurementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Procurement',
      default: null,
      index: true
    },
    qualityInspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QualityInspection',
      default: null
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true
    },
    acceptedQuantity: {
      type: Number,
      required: true,
      min: [0.01, 'Accepted quantity must be greater than 0']
    },
    unit: {
      type: String,
      default: 'KG'
    },
    basePricePerKg: {
      type: Number,
      required: true,
      min: [0, 'Base price cannot be negative']
    },
    agreedPricePerKg: {
      type: Number,
      default: null,
      min: [0, 'Agreed price cannot be negative']
    },
    grade: {
      type: String,
      default: 'GRADE_A'
    },
    priceMultiplier: {
      type: Number,
      default: 1.0
    },
    effectiveRatePerKg: {
      type: Number,
      required: true,
      min: [0, 'Effective rate cannot be negative']
    },
    grossAmount: {
      type: Number,
      required: true,
      min: [0, 'Gross amount cannot be negative']
    },
    deductions: [deductionSchema],
    totalDeductions: {
      type: Number,
      default: 0,
      min: [0, 'Total deductions cannot be negative']
    },
    adjustments: [adjustmentSchema],
    totalAdjustments: {
      type: Number,
      default: 0,
      min: [0, 'Total adjustments cannot be negative']
    },
    netAmount: {
      type: Number,
      required: true,
      min: [0, 'Net amount cannot be negative']
    },
    status: {
      type: String,
      enum: Object.values(SETTLEMENT_STATUS),
      default: SETTLEMENT_STATUS.CALCULATED,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true
    },
    paymentReference: {
      type: String,
      default: null
    },
    paymentMethod: {
      type: String,
      default: 'DIRECT_BANK_TRANSFER'
    },
    bankAccountLast4: {
      type: String,
      default: '0000'
    },
    settlementDate: {
      type: Date,
      default: Date.now
    },
    paidAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

settlementSchema.index({ farmerId: 1, createdAt: -1 });

module.exports = mongoose.model('Settlement', settlementSchema);
