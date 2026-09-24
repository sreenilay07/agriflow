const BuyerProfile = require('../models/BuyerProfile');
const User = require('../models/User');
const PurchaseOrder = require('../models/PurchaseOrder');
const { ROLES } = require('../constants/roles');
const { BUYER_VERIFICATION_STATUS, PURCHASE_ORDER_STATUS } = require('../constants/status');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');
const AuditLog = require('../models/AuditLog');

/**
 * Register or update a Buyer profile
 */
const upsertBuyerProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  let profile = await BuyerProfile.findOne({ userId });
  if (profile) {
    Object.assign(profile, {
      organizationName: data.organizationName || profile.organizationName,
      businessName: data.businessName || profile.businessName,
      businessType: data.businessType || profile.businessType,
      gstin: data.gstin || profile.gstin,
      contactPerson: data.contactPerson || profile.contactPerson,
      phone: data.phone || profile.phone || user.phoneNumber,
      email: data.email || profile.email || user.email,
      address: data.address || profile.address,
      district: data.district || profile.district,
      state: data.state || profile.state,
      pincode: data.pincode || profile.pincode,
      operatingRegions: data.operatingRegions || profile.operatingRegions,
      preferredCategories: data.preferredCategories || profile.preferredCategories
    });
    await profile.save();
  } else {
    profile = await BuyerProfile.create({
      userId,
      organizationName: data.organizationName,
      businessName: data.businessName || '',
      businessType: data.businessType || 'WHOLESALER',
      gstin: data.gstin || '',
      contactPerson: data.contactPerson || user.fullName,
      phone: data.phone || user.phoneNumber,
      email: data.email || user.email,
      address: data.address || '',
      district: data.district || user.district || '',
      state: data.state || user.state || '',
      pincode: data.pincode || '',
      operatingRegions: data.operatingRegions || [],
      preferredCategories: data.preferredCategories || [],
      verificationStatus: BUYER_VERIFICATION_STATUS.PENDING
    });
  }

  return profile;
};

/**
 * Get buyer profile by user ID
 */
const getBuyerProfile = async (userId) => {
  let profile = await BuyerProfile.findOne({ userId }).populate('preferredCategories');
  return profile;
};

/**
 * Verify / approve buyer by Admin
 */
const updateBuyerVerification = async (buyerProfileId, status, actor, rejectionReason = '') => {
  if (!Object.values(BUYER_VERIFICATION_STATUS).includes(status)) {
    throw new BadRequestError(`Invalid verification status '${status}'.`);
  }

  const profile = await BuyerProfile.findById(buyerProfileId);
  if (!profile) {
    throw new NotFoundError('Buyer profile not found.');
  }

  profile.verificationStatus = status;
  profile.verifiedBy = actor?._id || actor;
  profile.verifiedAt = new Date();
  if (rejectionReason) {
    profile.rejectionReason = rejectionReason;
  }
  await profile.save();

  try {
    await AuditLog.create({
      action: `BUYER_VERIFICATION_${status}`,
      category: 'BUYER',
      entityId: profile._id,
      entityType: 'BuyerProfile',
      actorId: actor?._id || actor,
      actorRole: actor?.role || 'ADMIN',
      previousState: { verificationStatus: profile.verificationStatus },
      newState: { verificationStatus: status },
      details: `Buyer ${profile.organizationName} verification set to ${status}`
    });
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }

  return profile;
};

/**
 * Get buyer dashboard metrics
 */
const getBuyerDashboardMetrics = async (userId) => {
  const [activeOrders, inTransitOrders, completedOrders, allOrders] = await Promise.all([
    PurchaseOrder.countDocuments({
      buyer: userId,
      status: {
        $in: [
          PURCHASE_ORDER_STATUS.SUBMITTED,
          PURCHASE_ORDER_STATUS.UNDER_REVIEW,
          PURCHASE_ORDER_STATUS.APPROVED,
          PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED,
          PURCHASE_ORDER_STATUS.FULLY_ALLOCATED,
          PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH
        ]
      }
    }),
    PurchaseOrder.countDocuments({
      buyer: userId,
      status: {
        $in: [
          PURCHASE_ORDER_STATUS.DISPATCHED,
          PURCHASE_ORDER_STATUS.PARTIALLY_DISPATCHED,
          PURCHASE_ORDER_STATUS.PARTIALLY_DELIVERED
        ]
      }
    }),
    PurchaseOrder.countDocuments({
      buyer: userId,
      status: {
        $in: [
          PURCHASE_ORDER_STATUS.DELIVERED,
          PURCHASE_ORDER_STATUS.COMPLETED
        ]
      }
    }),
    PurchaseOrder.find({ buyer: userId })
  ]);

  const totalProcurementValue = allOrders.reduce((sum, order) => sum + (order.totalValue || 0), 0);
  const totalQuantityKg = allOrders.reduce((sum, order) => sum + (order.totalQuantityKg || 0), 0);

  return {
    activeOrders,
    inTransitOrders,
    completedOrders,
    totalOrders: allOrders.length,
    totalProcurementValue,
    totalQuantityKg
  };
};

module.exports = {
  upsertBuyerProfile,
  getBuyerProfile,
  updateBuyerVerification,
  getBuyerDashboardMetrics
};
