const Settlement = require('../models/Settlement');
const Payment = require('../models/Payment');
const ProduceLot = require('../models/ProduceLot');
const Crop = require('../models/Crop');
const QualityInspection = require('../models/QualityInspection');
const FarmerProfile = require('../models/FarmerProfile');
const { PRODUCE_LOT_STATUS, PAYMENT_STATUS, SETTLEMENT_STATUS } = require('../constants/status');
const { ROLES } = require('../constants/roles');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/customErrors');
const { transitionLot } = require('./stateMachine.service');

/**
 * Generate unique settlement number (SET-YYYY-MM-XXXXXX)
 */
const generateSettlementNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = await Settlement.countDocuments();
  const seq = String(count + 1).padStart(6, '0');
  return `SET-${year}-${month}-${seq}`;
};

/**
 * Server-authoritative calculation for settlement preview
 * Formula: Accepted quantity × Agreed rate = Gross amount (+ adjustments - deductions = Net settlement)
 */
const calculateSettlementPreview = async (data) => {
  const { cropId, acceptedQuantity, grade, deductions = [], adjustments = [], agreedPricePerKg } = data;

  const crop = await Crop.findById(cropId);
  if (!crop) {
    throw new NotFoundError('Crop not found for settlement calculation.');
  }

  const qty = Number(acceptedQuantity);
  if (isNaN(qty) || qty <= 0) {
    throw new BadRequestError('Accepted quantity must be a positive number greater than 0.');
  }

  const basePrice = Number(crop.basePricePerKg || 25);
  // Persisted or specified agreed procurement price, otherwise fallback to basePrice
  const agreedPrice = (agreedPricePerKg !== undefined && agreedPricePerKg !== null && Number(agreedPricePerKg) > 0)
    ? Number(agreedPricePerKg)
    : basePrice;

  // Determine grade multiplier
  let priceMultiplier = 1.0;
  if (grade === 'GRADE_A') priceMultiplier = 1.05;
  else if (grade === 'GRADE_B') priceMultiplier = 1.0;
  else if (grade === 'GRADE_C') priceMultiplier = 0.88;

  const effectiveRate = Math.round(agreedPrice * priceMultiplier * 100) / 100;
  const grossAmount = Math.round(qty * effectiveRate * 100) / 100;

  // Calculate deductions
  let totalDeductions = 0;
  const parsedDeductions = deductions.map(d => {
    const amt = Math.round(Number(d.amount || 0) * 100) / 100;
    if (amt < 0) throw new BadRequestError('Deduction amounts cannot be negative.');
    totalDeductions += amt;
    return {
      deductionType: d.deductionType || 'OTHER',
      amount: amt,
      description: d.description || ''
    };
  });
  totalDeductions = Math.round(totalDeductions * 100) / 100;

  // Calculate adjustments
  let totalAdjustments = 0;
  const parsedAdjustments = adjustments.map(a => {
    const amt = Math.round(Number(a.amount || 0) * 100) / 100;
    if (amt < 0) throw new BadRequestError('Adjustment amounts cannot be negative.');
    totalAdjustments += amt;
    return {
      adjustmentType: a.adjustmentType || 'OTHER',
      amount: amt,
      description: a.description || ''
    };
  });
  totalAdjustments = Math.round(totalAdjustments * 100) / 100;

  const netAmount = Math.max(0, Math.round((grossAmount - totalDeductions + totalAdjustments) * 100) / 100);

  return {
    crop: {
      _id: crop._id,
      name: crop.name,
      code: crop.code,
      basePricePerKg: basePrice
    },
    acceptedQuantity: qty,
    agreedPricePerKg: agreedPrice,
    basePricePerKg: basePrice,
    grade: grade || 'GRADE_A',
    priceMultiplier,
    effectiveRatePerKg: effectiveRate,
    grossAmount,
    deductions: parsedDeductions,
    totalDeductions,
    adjustments: parsedAdjustments,
    totalAdjustments,
    netAmount,
    breakdown: {
      acceptedQuantity: qty,
      agreedRatePerKg: agreedPrice,
      effectiveRatePerKg: effectiveRate,
      grossAmount,
      totalAdjustments,
      totalDeductions,
      netSettlement: netAmount,
      formula: `(${qty} KG × ₹${effectiveRate}/KG) + ₹${totalAdjustments} - ₹${totalDeductions} = ₹${netAmount}`
    }
  };
};

/**
 * Finalize and create official farmer settlement record
 */
const createSettlement = async (lotId, data, actorUser) => {
  const lot = await ProduceLot.findById(lotId).populate('cropId').populate('farmerId');
  if (!lot) {
    throw new NotFoundError('Produce lot not found.');
  }

  if (
    lot.status !== PRODUCE_LOT_STATUS.ACCEPTED &&
    lot.status !== PRODUCE_LOT_STATUS.STORED &&
    lot.status !== PRODUCE_LOT_STATUS.ALLOCATED
  ) {
    throw new BadRequestError(
      `Cannot generate settlement for lot in status '${lot.status}'. Lot must be ACCEPTED or STORED.`
    );
  }

  if (lot.settlementId) {
    throw new BadRequestError('Settlement record has already been generated for this produce lot.');
  }

  // Get grade from inspection if available
  let grade = 'GRADE_A';
  if (lot.qualityInspectionId) {
    const inspection = await QualityInspection.findById(lot.qualityInspectionId);
    if (inspection) grade = inspection.assignedGrade;
  }

  const calculation = await calculateSettlementPreview({
    cropId: lot.cropId._id || lot.cropId,
    acceptedQuantity: lot.acceptedQuantity,
    grade,
    agreedPricePerKg: data.agreedPricePerKg || lot.agreedPricePerKg,
    deductions: data.deductions || [],
    adjustments: data.adjustments || []
  });

  // Fetch farmer bank details
  let bankLast4 = '0000';
  const profile = await FarmerProfile.findOne({ userId: lot.farmerId._id });
  if (profile && profile.bankAccountLast4) {
    bankLast4 = profile.bankAccountLast4;
  }

  const settlementNumber = await generateSettlementNumber();

  const settlement = new Settlement({
    settlementNumber,
    farmerId: lot.farmerId._id,
    organizationId: lot.organizationId || actorUser.organizationId || null,
    lotId: lot._id,
    procurementId: lot.procurementId || null,
    qualityInspectionId: lot.qualityInspectionId || null,
    cropId: lot.cropId._id || lot.cropId,
    acceptedQuantity: calculation.acceptedQuantity,
    unit: lot.unit || 'KG',
    basePricePerKg: calculation.crop.basePricePerKg,
    agreedPricePerKg: calculation.agreedPricePerKg,
    grade: calculation.grade,
    priceMultiplier: calculation.priceMultiplier,
    effectiveRatePerKg: calculation.effectiveRatePerKg,
    grossAmount: calculation.grossAmount,
    deductions: calculation.deductions,
    totalDeductions: calculation.totalDeductions,
    adjustments: calculation.adjustments,
    totalAdjustments: calculation.totalAdjustments,
    netAmount: calculation.netAmount,
    status: SETTLEMENT_STATUS.CALCULATED,
    paymentStatus: PAYMENT_STATUS.PENDING,
    bankAccountLast4: bankLast4,
    settlementDate: new Date(),
    createdBy: actorUser._id,
    remarks: data.remarks || 'Standard procurement settlement calculation'
  });

  await settlement.save();

  // Create or link payment record
  const payment = new Payment({
    procurementId: lot.procurementId || null,
    farmerId: lot.farmerId._id,
    amount: calculation.netAmount,
    status: PAYMENT_STATUS.PENDING,
    referenceNumber: `PAY-${settlementNumber}`
  });
  await payment.save();

  lot.settlementId = settlement._id;
  await lot.save();

  return settlement;
};

/**
 * List farmer settlements
 */
const getFarmerSettlements = async (farmerId, query = {}) => {
  const filter = { farmerId };
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

  const settlements = await Settlement.find(filter)
    .populate('lotId', 'lotNumber declaredQuantity acceptedQuantity status')
    .populate('cropId', 'name code unit')
    .sort({ createdAt: -1 });

  return settlements;
};

/**
 * Get settlement details by ID
 */
const getSettlementById = async (settlementId, user) => {
  const settlement = await Settlement.findById(settlementId)
    .populate('farmerId', 'fullName phoneNumber email')
    .populate('lotId')
    .populate('cropId')
    .populate('qualityInspectionId')
    .populate('createdBy', 'fullName role');

  if (!settlement) {
    throw new NotFoundError('Settlement record not found.');
  }

  if (user.role === ROLES.FARMER && settlement.farmerId._id.toString() !== user._id.toString()) {
    throw new ForbiddenError('You are not authorized to view another farmer\'s settlement.');
  }

  return settlement;
};

/**
 * Update payment status for a settlement
 */
const updatePaymentStatus = async (settlementId, data, actorUser) => {
  const { paymentStatus, paymentReference } = data;

  const settlement = await Settlement.findById(settlementId);
  if (!settlement) {
    throw new NotFoundError('Settlement record not found.');
  }

  if (!Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
    throw new BadRequestError(`Invalid payment status: ${paymentStatus}`);
  }

  settlement.paymentStatus = paymentStatus;
  if (paymentReference) {
    settlement.paymentReference = paymentReference;
  }
  if (paymentStatus === PAYMENT_STATUS.PAID) {
    settlement.paidAt = new Date();
    settlement.status = SETTLEMENT_STATUS.SETTLED;
  }

  await settlement.save();

  // Update associated payment record
  await Payment.findOneAndUpdate(
    { referenceNumber: `PAY-${settlement.settlementNumber}` },
    { status: paymentStatus, paymentCompletedAt: paymentStatus === PAYMENT_STATUS.PAID ? new Date() : null }
  );

  // Transition lot state to SETTLED if payment is completed
  if (paymentStatus === PAYMENT_STATUS.PAID) {
    const lot = await ProduceLot.findById(settlement.lotId);
    if (lot && lot.status !== PRODUCE_LOT_STATUS.SETTLED && lot.status !== PRODUCE_LOT_STATUS.CANCELLED) {
      await transitionLot(
        lot,
        PRODUCE_LOT_STATUS.SETTLED,
        actorUser,
        `Payment of ₹${settlement.netAmount} successfully disbursed to farmer`,
        { settlementNumber: settlement.settlementNumber, paymentReference }
      );
    }
  }

  return settlement;
};

module.exports = {
  generateSettlementNumber,
  calculateSettlementPreview,
  createSettlement,
  getFarmerSettlements,
  getSettlementById,
  updatePaymentStatus
};
