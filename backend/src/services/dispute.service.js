const Dispute = require('../models/Dispute');
const { DISPUTE_STATUS } = require('../constants/status');
const { ROLES } = require('../constants/roles');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/customErrors');
const AuditLog = require('../models/AuditLog');

/**
 * Generate unique dispute number (DISP-YYYY-MM-XXXXXX)
 */
const generateDisputeNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = await Dispute.countDocuments();
  const seq = String(count + 1).padStart(6, '0');
  return `DISP-${year}-${month}-${seq}`;
};

/**
 * Raise a new dispute
 */
const createDispute = async (userId, data) => {
  const { referenceType, referenceId, lotId, category, reason, description, evidenceUrls } = data;

  if (!referenceType || !referenceId) {
    throw new BadRequestError('Reference type and reference ID are required to lodge a dispute.');
  }

  if (!category || !reason || !description) {
    throw new BadRequestError('Category, reason, and description are required.');
  }

  const disputeNumber = await generateDisputeNumber();

  const dispute = new Dispute({
    disputeNumber,
    raisedBy: userId,
    referenceType,
    referenceId,
    lotId: lotId || null,
    category,
    reason: reason.trim(),
    description: description.trim(),
    evidenceUrls: evidenceUrls || [],
    status: DISPUTE_STATUS.OPEN
  });

  await dispute.save();

  try {
    await AuditLog.create({
      userId,
      actorId: userId,
      role: 'FARMER',
      action: 'DISPUTE_RAISED',
      entity: 'DISPUTE',
      targetType: 'DISPUTE',
      entityId: dispute._id.toString(),
      metadata: { disputeNumber, category, referenceType, referenceId }
    });
  } catch (err) {
    console.warn('Could not create audit log for dispute:', err.message);
  }

  return dispute;
};

/**
 * List disputes for a user or admin
 */
const getDisputes = async (user, query = {}) => {
  const filter = {};
  if (user.role === ROLES.FARMER) {
    filter.raisedBy = user._id;
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.category) {
    filter.category = query.category;
  }

  const disputes = await Dispute.find(filter)
    .populate('raisedBy', 'fullName phoneNumber role')
    .populate('lotId', 'lotNumber declaredQuantity acceptedQuantity status')
    .populate('assignedTo', 'fullName role')
    .sort({ createdAt: -1 });

  return disputes;
};

/**
 * Get dispute by ID
 */
const getDisputeById = async (disputeId, user) => {
  const dispute = await Dispute.findById(disputeId)
    .populate('raisedBy', 'fullName phoneNumber email role')
    .populate('lotId')
    .populate('assignedTo', 'fullName role');

  if (!dispute) {
    throw new NotFoundError('Dispute record not found.');
  }

  if (user.role === ROLES.FARMER && dispute.raisedBy._id.toString() !== user._id.toString()) {
    throw new ForbiddenError('You are not authorized to view another user\'s dispute.');
  }

  return dispute;
};

/**
 * Review or resolve dispute (Admin / Manager)
 */
const resolveDispute = async (disputeId, data, actorUser) => {
  const { status, resolution } = data;

  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
    throw new NotFoundError('Dispute record not found.');
  }

  if (!Object.values(DISPUTE_STATUS).includes(status)) {
    throw new BadRequestError(`Invalid dispute status: ${status}`);
  }

  dispute.status = status;
  dispute.resolution = resolution || dispute.resolution;
  dispute.assignedTo = actorUser._id;
  if (status === DISPUTE_STATUS.RESOLVED || status === DISPUTE_STATUS.CLOSED) {
    dispute.resolvedAt = new Date();
  }

  await dispute.save();

  try {
    await AuditLog.create({
      userId: actorUser._id,
      actorId: actorUser._id,
      role: actorUser.role,
      action: `DISPUTE_STATUS_${status}`,
      entity: 'DISPUTE',
      targetType: 'DISPUTE',
      entityId: dispute._id.toString(),
      metadata: { disputeNumber: dispute.disputeNumber, status, resolution }
    });
  } catch (err) {
    console.warn('Could not create audit log for dispute resolution:', err.message);
  }

  return dispute;
};

module.exports = {
  generateDisputeNumber,
  createDispute,
  getDisputes,
  getDisputeById,
  resolveDispute
};
