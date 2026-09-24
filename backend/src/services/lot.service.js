const ProduceLot = require('../models/ProduceLot');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const ProcurementCentre = require('../models/ProcurementCentre');
const Procurement = require('../models/Procurement');
const Token = require('../models/Token');
const { PRODUCE_LOT_STATUS, TOKEN_STATUS } = require('../constants/status');
const { ROLES } = require('../constants/roles');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/customErrors');
const { transitionLot } = require('./stateMachine.service');

/**
 * Generate a unique human-readable lot number (MM-YYYY-MM-XXXXXX)
 */
const generateLotNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = await ProduceLot.countDocuments();
  const seq = String(count + 1).padStart(6, '0');
  return `MM-${year}-${month}-${seq}`;
};

/**
 * Create a new Produce Lot
 */
const createLot = async (farmerId, data) => {
  const { cropId, declaredQuantity, farmId, harvestDate, collectionCentreId, unit } = data;

  if (!cropId) {
    throw new BadRequestError('Crop selection is required.');
  }

  const crop = await Crop.findById(cropId);
  if (!crop || crop.status !== 'ACTIVE') {
    throw new BadRequestError('Selected crop is invalid or inactive.');
  }

  const quantity = Number(declaredQuantity);
  if (isNaN(quantity) || quantity <= 0) {
    throw new BadRequestError('Declared quantity must be a positive number greater than 0.');
  }

  if (farmId) {
    const farm = await Farm.findById(farmId);
    if (!farm || farm.farmerId.toString() !== farmerId.toString()) {
      throw new BadRequestError('Invalid farm specified for this farmer.');
    }
  }

  if (collectionCentreId) {
    const centre = await ProcurementCentre.findById(collectionCentreId);
    if (!centre || centre.status !== 'ACTIVE') {
      throw new BadRequestError('Selected collection centre is invalid or inactive.');
    }
  }

  const lotNumber = await generateLotNumber();

  const lot = new ProduceLot({
    lotNumber,
    farmerId,
    farmId: farmId || null,
    cropId,
    declaredQuantity: quantity,
    unit: unit || crop.unit || 'KG',
    harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
    collectionCentreId: collectionCentreId || null,
    status: PRODUCE_LOT_STATUS.CREATED,
    lifecycleHistory: [
      {
        fromStatus: null,
        toStatus: PRODUCE_LOT_STATUS.CREATED,
        timestamp: new Date(),
        changedBy: farmerId,
        reason: 'Produce lot created by farmer',
        metadata: { declaredQuantity: quantity, cropCode: crop.code }
      }
    ]
  });

  await lot.save();
  return lot;
};

/**
 * List farmer produce lots
 */
const getFarmerLots = async (farmerId, query = {}) => {
  const filter = { farmerId };

  if (query.status) {
    filter.status = query.status;
  }
  if (query.cropId) {
    filter.cropId = query.cropId;
  }

  const lots = await ProduceLot.find(filter)
    .populate('cropId', 'name code unit category basePricePerKg localNames')
    .populate('farmId', 'farmName village acreage surveyNumber')
    .populate('collectionCentreId', 'name code district village')
    .populate('bookingId', 'bookingReference preferredDate preferredTimeSlot status')
    .populate('qualityInspectionId', 'inspectionNumber assignedGrade qualityScore moisturePercentage acceptedQuantity rejectedQuantity')
    .populate('warehouseId', 'name code')
    .populate('settlementId', 'settlementNumber netAmount paymentStatus')
    .sort({ createdAt: -1 });

  return lots;
};

/**
 * Query produce lots with filters (Staff / Inspectors / Managers)
 */
const getLots = async (query = {}, actorUser) => {
  const filter = {};
  if (query.status) {
    if (query.status.includes(',')) {
      filter.status = { $in: query.status.split(',') };
    } else {
      filter.status = query.status;
    }
  }
  if (query.collectionCentreId) filter.collectionCentreId = query.collectionCentreId;
  if (query.cropId) filter.cropId = query.cropId;

  const lots = await ProduceLot.find(filter)
    .populate('farmerId', 'fullName phoneNumber email')
    .populate('cropId', 'name code unit category basePricePerKg localNames')
    .populate('farmId', 'farmName village acreage surveyNumber')
    .populate('collectionCentreId', 'name code district village')
    .populate('qualityInspectionId', 'inspectionNumber assignedGrade qualityScore moisturePercentage acceptedQuantity rejectedQuantity')
    .populate('warehouseId', 'name code')
    .populate('settlementId', 'settlementNumber netAmount paymentStatus')
    .sort({ createdAt: -1 });

  return lots;
};

/**
 * Get lot by ID with access control
 */
const getLotById = async (lotId, user) => {
  const lot = await ProduceLot.findById(lotId)
    .populate('farmerId', 'fullName phoneNumber email')
    .populate('cropId')
    .populate('farmId')
    .populate('collectionCentreId')
    .populate('bookingId')
    .populate('tokenId')
    .populate('qualityInspectionId')
    .populate('warehouseId')
    .populate('procurementId')
    .populate('settlementId');

  if (!lot) {
    throw new NotFoundError('Produce lot not found.');
  }

  // If user is a farmer, only allow viewing their own lot
  if (user.role === ROLES.FARMER && lot.farmerId._id.toString() !== user._id.toString()) {
    throw new ForbiddenError('You are not authorized to view another farmer\'s produce lot.');
  }

  return lot;
};

/**
 * Get lot by lot number
 */
const getLotByNumber = async (lotNumber, user) => {
  const lot = await ProduceLot.findOne({ lotNumber: lotNumber.toUpperCase().trim() })
    .populate('farmerId', 'fullName phoneNumber')
    .populate('cropId')
    .populate('farmId')
    .populate('collectionCentreId')
    .populate('bookingId')
    .populate('tokenId')
    .populate('qualityInspectionId')
    .populate('warehouseId')
    .populate('procurementId')
    .populate('settlementId');

  if (!lot) {
    throw new NotFoundError(`Produce lot with number '${lotNumber}' not found.`);
  }

  if (user && user.role === ROLES.FARMER && lot.farmerId._id.toString() !== user._id.toString()) {
    throw new ForbiddenError('You are not authorized to view another farmer\'s produce lot.');
  }

  return lot;
};

/**
 * Receive Produce Lot at Collection Centre
 */
const receiveLot = async (lotId, data, actorUser) => {
  const { receivedQuantity, collectionCentreId, notes } = data;

  const lot = await ProduceLot.findById(lotId).populate('cropId');
  if (!lot) {
    throw new NotFoundError('Produce lot not found.');
  }

  if (lot.status !== PRODUCE_LOT_STATUS.SCHEDULED && lot.status !== PRODUCE_LOT_STATUS.CREATED) {
    throw new BadRequestError(`Cannot receive lot in status '${lot.status}'. Lot must be CREATED or SCHEDULED.`);
  }

  const quantity = Number(receivedQuantity);
  if (isNaN(quantity) || quantity <= 0) {
    throw new BadRequestError('Received quantity must be a positive number greater than 0.');
  }

  const centreId = collectionCentreId || actorUser.centreId || lot.collectionCentreId;
  if (!centreId) {
    throw new BadRequestError('Collection centre reference is required.');
  }

  lot.receivedQuantity = quantity;
  lot.receivedAt = new Date();
  lot.receivedBy = actorUser._id;
  lot.collectionCentreId = centreId;
  lot.receivingNotes = notes || '';

  // Transition to RECEIVED then UNDER_INSPECTION
  await transitionLot(
    lot,
    PRODUCE_LOT_STATUS.RECEIVED,
    actorUser,
    'Lot physically weighed and received at collection centre',
    { receivedQuantity: quantity, centreId }
  );

  await transitionLot(
    lot,
    PRODUCE_LOT_STATUS.UNDER_INSPECTION,
    actorUser,
    'Lot queued for Quality Inspector assessment'
  );

  // Update Procurement actualQuantity if linked
  if (lot.procurementId) {
    const procurement = await Procurement.findById(lot.procurementId);
    if (procurement) {
      procurement.actualQuantity = quantity;
      procurement.status = 'ARRIVED';
      procurement.arrivalTime = new Date();
      await procurement.save();
    }
  }

  // Update token if linked
  if (lot.tokenId) {
    const token = await Token.findById(lot.tokenId);
    if (token) {
      token.status = TOKEN_STATUS.ARRIVED;
      await token.save();
    }
  }

  return lot;
};

/**
 * Cancel a Produce Lot
 */
const cancelLot = async (lotId, user, reason = '') => {
  const lot = await ProduceLot.findById(lotId);
  if (!lot) {
    throw new NotFoundError('Produce lot not found.');
  }

  if (user.role === ROLES.FARMER && lot.farmerId.toString() !== user._id.toString()) {
    throw new ForbiddenError('You cannot cancel another farmer\'s produce lot.');
  }

  if (lot.status !== PRODUCE_LOT_STATUS.CREATED && lot.status !== PRODUCE_LOT_STATUS.SCHEDULED) {
    throw new BadRequestError(`Cannot cancel produce lot in status '${lot.status}'.`);
  }

  await transitionLot(lot, PRODUCE_LOT_STATUS.CANCELLED, user, reason || 'Cancelled by user');
  return lot;
};

module.exports = {
  generateLotNumber,
  createLot,
  getFarmerLots,
  getLots,
  getLotById,
  getLotByNumber,
  receiveLot,
  cancelLot
};
