const QualityInspection = require('../models/QualityInspection');
const ProduceLot = require('../models/ProduceLot');
const Crop = require('../models/Crop');
const Procurement = require('../models/Procurement');
const { PRODUCE_LOT_STATUS, QUALITY_GRADE, QUALITY_INSPECTION_STATUS } = require('../constants/status');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');
const { transitionLot } = require('./stateMachine.service');

/**
 * Generate a unique inspection number (QI-YYYY-MM-XXXXXX)
 */
const generateInspectionNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = await QualityInspection.countDocuments();
  const seq = String(count + 1).padStart(6, '0');
  return `QI-${year}-${month}-${seq}`;
};

/**
 * Determine crop grade from parameters according to standard crop rules
 */
const evaluateGrade = (crop, metrics) => {
  const moisture = Number(metrics.moisturePercentage || 0);
  const foreignMatter = Number(metrics.foreignMatterPercentage || 0);
  const brokenGrains = Number(metrics.brokenGrainPercentage || 0);
  const damage = Number(metrics.damagePercentage || 0);

  // If crop has configured standard grading rules, match them
  if (crop.standardGradingRules && crop.standardGradingRules.length > 0) {
    const sortedRules = [...crop.standardGradingRules].sort((a, b) => (b.priceMultiplier || 1) - (a.priceMultiplier || 1));
    for (const rule of sortedRules) {
      if (rule.grade === 'REJECTED') continue;
      if (
        moisture <= (rule.maxMoisture || 16) &&
        foreignMatter <= (rule.maxForeignMatter || 3) &&
        brokenGrains <= (rule.maxBrokenGrains || 8)
      ) {
        return rule.grade;
      }
    }
  }

  // Default heuristic grading
  if (moisture <= 14 && foreignMatter <= 1 && brokenGrains <= 3 && damage <= 1) {
    return QUALITY_GRADE.GRADE_A;
  }
  if (moisture <= 16 && foreignMatter <= 3 && brokenGrains <= 7 && damage <= 3) {
    return QUALITY_GRADE.GRADE_B;
  }
  if (moisture <= 19 && foreignMatter <= 5 && brokenGrains <= 12 && damage <= 6) {
    return QUALITY_GRADE.GRADE_C;
  }
  return QUALITY_GRADE.REJECTED;
};

/**
 * Calculate numerical quality score (0 - 100)
 */
const calculateQualityScore = (metrics) => {
  let score = 100;
  const moisture = Number(metrics.moisturePercentage || 0);
  const foreignMatter = Number(metrics.foreignMatterPercentage || 0);
  const brokenGrains = Number(metrics.brokenGrainPercentage || 0);
  const damage = Number(metrics.damagePercentage || 0);

  if (moisture > 12) score -= (moisture - 12) * 4;
  if (foreignMatter > 0) score -= foreignMatter * 8;
  if (brokenGrains > 0) score -= brokenGrains * 3;
  if (damage > 0) score -= damage * 6;

  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Submit Quality Inspection for a Produce Lot
 */
const submitInspection = async (lotId, data, inspectorUser) => {
  const lot = await ProduceLot.findById(lotId).populate('cropId');
  if (!lot) {
    throw new NotFoundError('Produce lot not found.');
  }

  if (lot.status !== PRODUCE_LOT_STATUS.UNDER_INSPECTION && lot.status !== PRODUCE_LOT_STATUS.RECEIVED) {
    throw new BadRequestError(
      `Cannot inspect lot in status '${lot.status}'. Lot must be RECEIVED or UNDER_INSPECTION.`
    );
  }

  const receivedQty = lot.receivedQuantity !== null ? lot.receivedQuantity : lot.declaredQuantity;
  if (!receivedQty || receivedQty <= 0) {
    throw new BadRequestError('Lot has not been received or has zero quantity.');
  }

  let {
    moisturePercentage,
    foreignMatterPercentage,
    brokenGrainPercentage,
    damagePercentage,
    assignedGrade,
    acceptedQuantity,
    rejectedQuantity,
    rejectionReason,
    remarks,
    parameters,
    evidencePhotos
  } = data;

  const acceptedQty = Number(acceptedQuantity !== undefined ? acceptedQuantity : receivedQty);
  const rejectedQty = Number(rejectedQuantity || 0);

  if (isNaN(acceptedQty) || acceptedQty < 0) {
    throw new BadRequestError('Accepted quantity cannot be negative.');
  }
  if (isNaN(rejectedQty) || rejectedQty < 0) {
    throw new BadRequestError('Rejected quantity cannot be negative.');
  }

  // Server-side validation: accepted + rejected <= received
  if (acceptedQty + rejectedQty > receivedQty + 0.001) {
    throw new BadRequestError(
      `Accepted quantity (${acceptedQty} kg) + Rejected quantity (${rejectedQty} kg) cannot exceed total received quantity (${receivedQty} kg).`,
      'INVALID_QUANTITY_SPLIT'
    );
  }

  // Auto-determine grade if not explicitly forced
  const metrics = {
    moisturePercentage: Number(moisturePercentage || 0),
    foreignMatterPercentage: Number(foreignMatterPercentage || 0),
    brokenGrainPercentage: Number(brokenGrainPercentage || 0),
    damagePercentage: Number(damagePercentage || 0)
  };

  const finalGrade = assignedGrade || evaluateGrade(lot.cropId, metrics);
  const qualityScore = calculateQualityScore(metrics);

  const inspectionNumber = await generateInspectionNumber();

  const inspection = new QualityInspection({
    inspectionNumber,
    lotId: lot._id,
    cropId: lot.cropId._id || lot.cropId,
    inspectorId: inspectorUser._id,
    inspectionDate: new Date(),
    parameters: parameters || [],
    moisturePercentage: metrics.moisturePercentage,
    foreignMatterPercentage: metrics.foreignMatterPercentage,
    brokenGrainPercentage: metrics.brokenGrainPercentage,
    damagePercentage: metrics.damagePercentage,
    assignedGrade: finalGrade,
    qualityScore,
    declaredQuantity: lot.declaredQuantity,
    receivedQuantity: receivedQty,
    acceptedQuantity: acceptedQty,
    rejectedQuantity: rejectedQty,
    rejectionReason: rejectionReason || '',
    remarks: remarks || '',
    evidencePhotos: evidencePhotos || [],
    status: QUALITY_INSPECTION_STATUS.COMPLETED
  });

  await inspection.save();

  // Update lot details and transition state
  lot.qualityInspectionId = inspection._id;
  lot.acceptedQuantity = acceptedQty;
  lot.rejectedQuantity = rejectedQty;

  if (acceptedQty > 0 && finalGrade !== QUALITY_GRADE.REJECTED) {
    await transitionLot(
      lot,
      PRODUCE_LOT_STATUS.ACCEPTED,
      inspectorUser,
      `Quality inspection completed with Grade ${finalGrade}`,
      { inspectionNumber, assignedGrade: finalGrade, qualityScore, acceptedQuantity: acceptedQty, rejectedQuantity: rejectedQty }
    );
  } else {
    await transitionLot(
      lot,
      PRODUCE_LOT_STATUS.REJECTED,
      inspectorUser,
      `Quality inspection failed: ${rejectionReason || 'Produce does not meet minimum quality criteria'}`,
      { inspectionNumber, assignedGrade: finalGrade, qualityScore, rejectedQuantity: rejectedQty }
    );
  }

  // Update procurement record if attached
  if (lot.procurementId) {
    const procurement = await Procurement.findById(lot.procurementId);
    if (procurement) {
      procurement.qualityInspectionId = inspection._id;
      procurement.acceptedQuantity = acceptedQty;
      procurement.rejectedQuantity = rejectedQty;
      procurement.grade = finalGrade;
      procurement.actualQuantity = receivedQty;
      await procurement.save();
    }
  }

  return inspection;
};

/**
 * Get inspection by ID
 */
const getInspectionById = async (inspectionId) => {
  const inspection = await QualityInspection.findById(inspectionId)
    .populate('lotId')
    .populate('cropId')
    .populate('inspectorId', 'fullName employeeId role');

  if (!inspection) {
    throw new NotFoundError('Quality inspection not found.');
  }
  return inspection;
};

/**
 * List inspections with optional filters
 */
const listInspections = async (query = {}) => {
  const filter = {};
  if (query.cropId) filter.cropId = query.cropId;
  if (query.assignedGrade) filter.assignedGrade = query.assignedGrade;
  if (query.inspectorId) filter.inspectorId = query.inspectorId;

  const inspections = await QualityInspection.find(filter)
    .populate('lotId', 'lotNumber declaredQuantity receivedQuantity status')
    .populate('cropId', 'name code unit')
    .populate('inspectorId', 'fullName')
    .sort({ createdAt: -1 });

  return inspections;
};

module.exports = {
  generateInspectionNumber,
  evaluateGrade,
  calculateQualityScore,
  submitInspection,
  getInspectionById,
  listInspections
};
