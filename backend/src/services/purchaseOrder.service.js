const PurchaseOrder = require('../models/PurchaseOrder');
const BuyerProfile = require('../models/BuyerProfile');
const Crop = require('../models/Crop');
const LotAllocation = require('../models/LotAllocation');
const Shipment = require('../models/Shipment');
const { PURCHASE_ORDER_STATUS, BUYER_VERIFICATION_STATUS } = require('../constants/status');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/customErrors');
const { transitionPurchaseOrder } = require('./stateMachine.service');
const Notification = require('../models/Notification');

/**
 * Generate sequential PO number: PO-YYYY-XXXXXX
 */
const generatePONumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `PO-${currentYear}-`;

  const latestPO = await PurchaseOrder.findOne({
    poNumber: { $regex: new RegExp(`^${prefix}`) }
  })
    .sort({ createdAt: -1 })
    .lean();

  let nextSeq = 1;
  if (latestPO && latestPO.poNumber) {
    const parts = latestPO.poNumber.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }
  }

  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
};

/**
 * Create a new Purchase Order from verified buyer
 */
const createPurchaseOrder = async (userId, data, actor) => {
  const buyerProfile = await BuyerProfile.findOne({ userId });
  if (!buyerProfile) {
    throw new BadRequestError('Buyer profile not found. Please complete your buyer organization registration.');
  }

  if (buyerProfile.verificationStatus !== BUYER_VERIFICATION_STATUS.VERIFIED) {
    throw new ForbiddenError(
      `Buyer organization '${buyerProfile.organizationName}' is currently ${buyerProfile.verificationStatus}. Only verified buyers can submit live purchase orders.`
    );
  }

  const { items, requestedDeliveryDate, deliveryAddress, notes } = data;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('At least one item is required in the Purchase Order.');
  }

  let calculatedSubtotal = 0;
  let totalQtyKg = 0;
  const processedItems = [];

  for (const item of items) {
    const qty = Number(item.requestedQuantityKg);
    const price = Number(item.agreedUnitPricePerKg);

    if (isNaN(qty) || qty <= 0) {
      throw new BadRequestError('Requested quantity must be greater than zero kg.');
    }
    if (isNaN(price) || price <= 0) {
      throw new BadRequestError('Agreed unit price must be positive.');
    }

    const crop = await Crop.findById(item.cropId || item.crop);
    if (!crop) {
      throw new BadRequestError(`Produce crop ID '${item.cropId || item.crop}' not found.`);
    }

    const itemSubtotal = Number((qty * price).toFixed(2));
    calculatedSubtotal += itemSubtotal;
    totalQtyKg += qty;

    processedItems.push({
      crop: crop._id,
      requestedGrade: item.requestedGrade || 'GRADE_A',
      requestedQuantityKg: qty,
      agreedUnitPricePerKg: price,
      allocatedQuantityKg: 0,
      dispatchedQuantityKg: 0,
      deliveredQuantityKg: 0,
      subtotal: itemSubtotal
    });
  }

  calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));
  const taxAmount = Number((calculatedSubtotal * 0.05).toFixed(2)); // 5% standard mandi cess / GST
  const totalValue = Number((calculatedSubtotal + taxAmount).toFixed(2));

  if (!requestedDeliveryDate || new Date(requestedDeliveryDate) < new Date(Date.now() - 86400000)) {
    throw new BadRequestError('Requested delivery date must be today or in the future.');
  }

  if (!deliveryAddress || !deliveryAddress.district || !deliveryAddress.state) {
    throw new BadRequestError('Valid delivery location (district & state) is required.');
  }

  const poNumber = await generatePONumber();

  const purchaseOrder = await PurchaseOrder.create({
    poNumber,
    buyer: userId,
    buyerProfile: buyerProfile._id,
    status: PURCHASE_ORDER_STATUS.SUBMITTED,
    items: processedItems,
    totalQuantityKg: totalQtyKg,
    allocatedQuantityKg: 0,
    deliveredQuantityKg: 0,
    subtotal: calculatedSubtotal,
    taxAmount,
    totalValue,
    requestedDeliveryDate: new Date(requestedDeliveryDate),
    deliveryAddress,
    notes: notes || '',
    lifecycleHistory: [
      {
        fromStatus: 'DRAFT',
        toStatus: PURCHASE_ORDER_STATUS.SUBMITTED,
        action: 'PO_SUBMITTED',
        performedBy: userId,
        notes: `Purchase order submitted by ${buyerProfile.organizationName}`,
        timestamp: new Date()
      }
    ]
  });

  return purchaseOrder;
};

/**
 * Get Purchase Orders with filter & pagination
 */
const getPurchaseOrders = async (query = {}, user) => {
  const filter = {};

  // If role is BUYER, restrict to own orders
  if (user.role === 'BUYER') {
    filter.buyer = user._id;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.poNumber = { $regex: query.search.trim(), $options: 'i' };
  }

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .populate('buyer', 'fullName phoneNumber email')
      .populate('buyerProfile', 'organizationName businessType gstin')
      .populate('items.crop', 'name category defaultUnit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PurchaseOrder.countDocuments(filter)
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get detailed Purchase Order by ID (with allocations, shipments, timeline)
 */
const getPurchaseOrderDetail = async (poId, user) => {
  const po = await PurchaseOrder.findById(poId)
    .populate('buyer', 'fullName phoneNumber email')
    .populate('buyerProfile', 'organizationName businessName businessType gstin contactPerson phone email')
    .populate('items.crop', 'name category defaultUnit qualityParameters')
    .populate('lifecycleHistory.performedBy', 'fullName role')
    .lean();

  if (!po) {
    throw new NotFoundError('Purchase order not found.');
  }

  // Authorization check
  if (user.role === 'BUYER' && String(po.buyer._id) !== String(user._id)) {
    throw new ForbiddenError('You are not authorized to view this Purchase Order.');
  }

  // Fetch allocations and shipments for full traceability
  const [allocations, shipments] = await Promise.all([
    LotAllocation.find({ purchaseOrder: po._id })
      .populate({
        path: 'produceLot',
        select: 'lotNumber harvestDate status declaredQuantity receivedQuantity farmer',
        populate: {
          path: 'farmer',
          select: 'fullName district'
        }
      })
      .populate('warehouse', 'name location district')
      .populate('inventory', 'batchNumber qualityGrade storageBay')
      .lean(),
    Shipment.find({ purchaseOrder: po._id })
      .populate('vehicle', 'vehicleNumber type transporterName driverName driverPhone')
      .populate('originWarehouse', 'name location')
      .lean()
  ]);

  return {
    ...po,
    allocations,
    shipments
  };
};

/**
 * Review Purchase Order (Approve / Reject) by Manager/Admin
 */
const reviewPurchaseOrder = async (poId, action, actor, rejectionReason = '') => {
  const po = await PurchaseOrder.findById(poId).populate('buyerProfile');
  if (!po) {
    throw new NotFoundError('Purchase order not found.');
  }

  if (![PURCHASE_ORDER_STATUS.SUBMITTED, PURCHASE_ORDER_STATUS.UNDER_REVIEW].includes(po.status)) {
    throw new BadRequestError(`Cannot review PO in status '${po.status}'.`);
  }

  let targetStatus;
  if (action === 'APPROVE') {
    targetStatus = PURCHASE_ORDER_STATUS.APPROVED;
  } else if (action === 'REJECT') {
    targetStatus = PURCHASE_ORDER_STATUS.REJECTED;
    if (!rejectionReason) {
      throw new BadRequestError('Rejection reason is required.');
    }
    po.rejectionReason = rejectionReason;
  } else {
    throw new BadRequestError("Action must be either 'APPROVE' or 'REJECT'.");
  }

  po.reviewedBy = actor._id;
  po.reviewedAt = new Date();

  await transitionPurchaseOrder(po, targetStatus, actor, rejectionReason);
  await po.save();

  // Send in-app notification to buyer
  try {
    await Notification.create({
      userId: po.buyer,
      title: action === 'APPROVE' ? 'Purchase Order Approved' : 'Purchase Order Rejected',
      message:
        action === 'APPROVE'
          ? `Your Purchase Order ${po.poNumber} has been approved by Mandi Procurement Operations.`
          : `Your Purchase Order ${po.poNumber} was rejected: ${rejectionReason}`,
      type: 'PAYMENT',
      metadata: { poId: po._id, poNumber: po.poNumber }
    });
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }

  return po;
};

module.exports = {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderDetail,
  reviewPurchaseOrder,
  generatePONumber
};
