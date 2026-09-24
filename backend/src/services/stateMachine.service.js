const { PRODUCE_LOT_STATUS, PURCHASE_ORDER_STATUS, SHIPMENT_STATUS } = require('../constants/status');
const { BadRequestError } = require('../utils/customErrors');
const AuditLog = require('../models/AuditLog');
const { emitRealtimeEvent, EVENT_TYPES, ROOMS } = require('./realtime/eventService');

const ALLOWED_LOT_TRANSITIONS = {
  [PRODUCE_LOT_STATUS.CREATED]: [
    PRODUCE_LOT_STATUS.SCHEDULED,
    PRODUCE_LOT_STATUS.CANCELLED
  ],
  [PRODUCE_LOT_STATUS.SCHEDULED]: [
    PRODUCE_LOT_STATUS.RECEIVED,
    PRODUCE_LOT_STATUS.CANCELLED
  ],
  [PRODUCE_LOT_STATUS.RECEIVED]: [
    PRODUCE_LOT_STATUS.UNDER_INSPECTION,
    PRODUCE_LOT_STATUS.CANCELLED
  ],
  [PRODUCE_LOT_STATUS.UNDER_INSPECTION]: [
    PRODUCE_LOT_STATUS.ACCEPTED,
    PRODUCE_LOT_STATUS.PARTIALLY_ACCEPTED,
    PRODUCE_LOT_STATUS.REJECTED,
    PRODUCE_LOT_STATUS.RECEIVED
  ],
  [PRODUCE_LOT_STATUS.ACCEPTED]: [
    PRODUCE_LOT_STATUS.STORED,
    PRODUCE_LOT_STATUS.REJECTED
  ],
  [PRODUCE_LOT_STATUS.PARTIALLY_ACCEPTED]: [
    PRODUCE_LOT_STATUS.STORED,
    PRODUCE_LOT_STATUS.REJECTED
  ],
  [PRODUCE_LOT_STATUS.REJECTED]: [
    PRODUCE_LOT_STATUS.CANCELLED,
    PRODUCE_LOT_STATUS.UNDER_INSPECTION
  ],
  [PRODUCE_LOT_STATUS.STORED]: [
    PRODUCE_LOT_STATUS.ALLOCATED,
    PRODUCE_LOT_STATUS.SETTLED
  ],
  [PRODUCE_LOT_STATUS.ALLOCATED]: [
    PRODUCE_LOT_STATUS.DISPATCHED,
    PRODUCE_LOT_STATUS.STORED
  ],
  [PRODUCE_LOT_STATUS.DISPATCHED]: [
    PRODUCE_LOT_STATUS.DELIVERED
  ],
  [PRODUCE_LOT_STATUS.DELIVERED]: [
    PRODUCE_LOT_STATUS.SETTLED
  ],
  [PRODUCE_LOT_STATUS.SETTLED]: [],
  [PRODUCE_LOT_STATUS.CANCELLED]: []
};

const ALLOWED_PO_TRANSITIONS = {
  [PURCHASE_ORDER_STATUS.DRAFT]: [
    PURCHASE_ORDER_STATUS.SUBMITTED,
    PURCHASE_ORDER_STATUS.CANCELLED
  ],
  [PURCHASE_ORDER_STATUS.SUBMITTED]: [
    PURCHASE_ORDER_STATUS.UNDER_REVIEW,
    PURCHASE_ORDER_STATUS.APPROVED,
    PURCHASE_ORDER_STATUS.REJECTED,
    PURCHASE_ORDER_STATUS.CANCELLED
  ],
  [PURCHASE_ORDER_STATUS.UNDER_REVIEW]: [
    PURCHASE_ORDER_STATUS.APPROVED,
    PURCHASE_ORDER_STATUS.REJECTED,
    PURCHASE_ORDER_STATUS.CANCELLED
  ],
  [PURCHASE_ORDER_STATUS.APPROVED]: [
    PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED,
    PURCHASE_ORDER_STATUS.FULLY_ALLOCATED,
    PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH,
    PURCHASE_ORDER_STATUS.CANCELLED
  ],
  [PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED]: [
    PURCHASE_ORDER_STATUS.FULLY_ALLOCATED,
    PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH,
    PURCHASE_ORDER_STATUS.PARTIALLY_DISPATCHED,
    PURCHASE_ORDER_STATUS.CANCELLED
  ],
  [PURCHASE_ORDER_STATUS.FULLY_ALLOCATED]: [
    PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH,
    PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED,
    PURCHASE_ORDER_STATUS.DISPATCHED,
    PURCHASE_ORDER_STATUS.CANCELLED
  ],
  [PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH]: [
    PURCHASE_ORDER_STATUS.PARTIALLY_DISPATCHED,
    PURCHASE_ORDER_STATUS.DISPATCHED,
    PURCHASE_ORDER_STATUS.CANCELLED
  ],
  [PURCHASE_ORDER_STATUS.PARTIALLY_DISPATCHED]: [
    PURCHASE_ORDER_STATUS.DISPATCHED,
    PURCHASE_ORDER_STATUS.PARTIALLY_DELIVERED,
    PURCHASE_ORDER_STATUS.DELIVERED
  ],
  [PURCHASE_ORDER_STATUS.DISPATCHED]: [
    PURCHASE_ORDER_STATUS.PARTIALLY_DELIVERED,
    PURCHASE_ORDER_STATUS.DELIVERED
  ],
  [PURCHASE_ORDER_STATUS.PARTIALLY_DELIVERED]: [
    PURCHASE_ORDER_STATUS.DELIVERED,
    PURCHASE_ORDER_STATUS.COMPLETED
  ],
  [PURCHASE_ORDER_STATUS.DELIVERED]: [
    PURCHASE_ORDER_STATUS.COMPLETED
  ],
  [PURCHASE_ORDER_STATUS.COMPLETED]: [],
  [PURCHASE_ORDER_STATUS.REJECTED]: [],
  [PURCHASE_ORDER_STATUS.CANCELLED]: []
};

const ALLOWED_SHIPMENT_TRANSITIONS = {
  [SHIPMENT_STATUS.PLANNED]: [
    SHIPMENT_STATUS.READY_FOR_DISPATCH,
    SHIPMENT_STATUS.DISPATCHED,
    SHIPMENT_STATUS.CANCELLED
  ],
  [SHIPMENT_STATUS.READY_FOR_DISPATCH]: [
    SHIPMENT_STATUS.DISPATCHED,
    SHIPMENT_STATUS.CANCELLED
  ],
  [SHIPMENT_STATUS.DISPATCHED]: [
    SHIPMENT_STATUS.IN_TRANSIT,
    SHIPMENT_STATUS.ARRIVED,
    SHIPMENT_STATUS.DELAYED,
    SHIPMENT_STATUS.DELIVERED,
    SHIPMENT_STATUS.CANCELLED
  ],
  [SHIPMENT_STATUS.IN_TRANSIT]: [
    SHIPMENT_STATUS.ARRIVED,
    SHIPMENT_STATUS.DELAYED,
    SHIPMENT_STATUS.DELIVERED
  ],
  [SHIPMENT_STATUS.DELAYED]: [
    SHIPMENT_STATUS.IN_TRANSIT,
    SHIPMENT_STATUS.ARRIVED,
    SHIPMENT_STATUS.DELIVERED
  ],
  [SHIPMENT_STATUS.ARRIVED]: [
    SHIPMENT_STATUS.DELIVERED
  ],
  [SHIPMENT_STATUS.DELIVERED]: [],
  [SHIPMENT_STATUS.CANCELLED]: []
};

/**
 * Check if a lot state transition is valid
 */
const isValidTransition = (currentStatus, targetStatus) => {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_LOT_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

const assertValidTransition = (currentStatus, targetStatus) => {
  if (!isValidTransition(currentStatus, targetStatus)) {
    throw new BadRequestError(
      `Invalid state transition from '${currentStatus}' to '${targetStatus}'. This operation violates the AgriTrade produce lot lifecycle constraints.`,
      'INVALID_STATE_TRANSITION'
    );
  }
};

/**
 * Check if a PO transition is valid
 */
const isValidPOTransition = (currentStatus, targetStatus) => {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_PO_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

const assertValidPOTransition = (currentStatus, targetStatus) => {
  if (!isValidPOTransition(currentStatus, targetStatus)) {
    throw new BadRequestError(
      `Invalid Purchase Order state transition from '${currentStatus}' to '${targetStatus}'.`,
      'INVALID_PO_TRANSITION'
    );
  }
};

/**
 * Check if a shipment transition is valid
 */
const isValidShipmentTransition = (currentStatus, targetStatus) => {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_SHIPMENT_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

const assertValidShipmentTransition = (currentStatus, targetStatus) => {
  if (!isValidShipmentTransition(currentStatus, targetStatus)) {
    throw new BadRequestError(
      `Invalid Shipment state transition from '${currentStatus}' to '${targetStatus}'.`,
      'INVALID_SHIPMENT_TRANSITION'
    );
  }
};

/**
 * Transition lot state, append lifecycle history and create an audit log
 */
const transitionLot = async (lot, targetStatus, actor = null, reason = '', metadata = {}) => {
  assertValidTransition(lot.status, targetStatus);

  const previousStatus = lot.status;
  lot.status = targetStatus;

  if (!lot.lifecycleHistory) {
    lot.lifecycleHistory = [];
  }

  const actorId = actor?._id || actor || null;

  lot.lifecycleHistory.push({
    fromStatus: previousStatus,
    toStatus: targetStatus,
    performedBy: actorId,
    action: `LOT_STATUS_${targetStatus}`,
    notes: reason,
    timestamp: new Date()
  });

  try {
    await AuditLog.create({
      action: `LOT_STATUS_${targetStatus}`,
      category: 'PRODUCE_LOT',
      entityId: lot._id,
      entityType: 'ProduceLot',
      actorId,
      actorRole: actor?.role || 'SYSTEM',
      previousState: { status: previousStatus },
      newState: { status: targetStatus, ...metadata },
      details: reason || `Produce lot ${lot.lotNumber || lot._id} moved to ${targetStatus}`
    });
  } catch (err) {
    // Non-blocking audit failure
    console.error('AuditLog creation failed during lot transition:', err.message);
  }

  // Realtime Event Emission
  try {
    const lotRooms = [
      ROOMS.allAdmins(),
      lot.farmerId ? ROOMS.farmer(lot.farmerId) : null,
      lot.farmerId ? ROOMS.user(lot.farmerId) : null,
      lot.collectionCentreId ? ROOMS.centre(lot.collectionCentreId) : null
    ].filter(Boolean);

    await emitRealtimeEvent(
      EVENT_TYPES.LOT_STATUS_CHANGED,
      {
        lotId: lot._id,
        lotNumber: lot.lotNumber,
        previousStatus,
        status: targetStatus,
        metadata
      },
      lotRooms,
      lot.farmerId ? {
        userId: lot.farmerId,
        type: 'LOT_UPDATE',
        title: `Produce Lot ${targetStatus}`,
        message: `Your produce lot #${lot.lotNumber || lot._id} status is now ${targetStatus}.`,
        priority: targetStatus === 'REJECTED' ? 'HIGH' : 'MEDIUM',
        entityType: 'ProduceLot',
        entityId: lot._id
      } : null
    );
  } catch (err) {
    console.error('Realtime emit failed for lot:', err.message);
  }

  return lot;
};

/**
 * Transition Purchase Order state
 */
const transitionPurchaseOrder = async (po, targetStatus, actor = null, reason = '', metadata = {}) => {
  assertValidPOTransition(po.status, targetStatus);

  const previousStatus = po.status;
  po.status = targetStatus;

  if (!po.lifecycleHistory) {
    po.lifecycleHistory = [];
  }

  const actorId = actor?._id || actor || null;

  po.lifecycleHistory.push({
    fromStatus: previousStatus,
    toStatus: targetStatus,
    performedBy: actorId,
    action: `PO_STATUS_${targetStatus}`,
    notes: reason,
    timestamp: new Date()
  });

  try {
    await AuditLog.create({
      action: `PO_STATUS_${targetStatus}`,
      category: 'PURCHASE_ORDER',
      entityId: po._id,
      entityType: 'PurchaseOrder',
      actorId,
      actorRole: actor?.role || 'SYSTEM',
      previousState: { status: previousStatus },
      newState: { status: targetStatus, ...metadata },
      details: reason || `Purchase Order ${po.poNumber || po._id} moved to ${targetStatus}`
    });
  } catch (err) {
    console.error('AuditLog creation failed during PO transition:', err.message);
  }

  // Realtime Event Emission
  try {
    const poRooms = [
      ROOMS.allAdmins(),
      ROOMS.role('CENTRE_MANAGER'),
      po.buyerId ? ROOMS.buyer(po.buyerId) : null,
      po.buyerId ? ROOMS.user(po.buyerId) : null
    ].filter(Boolean);

    await emitRealtimeEvent(
      EVENT_TYPES.PO_STATUS_CHANGED,
      {
        poId: po._id,
        poNumber: po.poNumber,
        previousStatus,
        status: targetStatus,
        metadata
      },
      poRooms,
      po.buyerId ? {
        userId: po.buyerId,
        type: 'PO_UPDATE',
        title: `Purchase Order ${targetStatus}`,
        message: `Your purchase order #${po.poNumber || po._id} is now ${targetStatus}.`,
        priority: targetStatus === 'APPROVED' || targetStatus === 'DELIVERED' ? 'HIGH' : 'MEDIUM',
        entityType: 'PurchaseOrder',
        entityId: po._id
      } : null
    );
  } catch (err) {
    console.error('Realtime emit failed for PO:', err.message);
  }

  return po;
};

/**
 * Transition Shipment state
 */
const transitionShipment = async (shipment, targetStatus, actor = null, location = '', notes = '') => {
  assertValidShipmentTransition(shipment.status, targetStatus);

  const previousStatus = shipment.status;
  shipment.status = targetStatus;

  if (!shipment.trackingEvents) {
    shipment.trackingEvents = [];
  }

  const actorId = actor?._id || actor || null;

  shipment.trackingEvents.push({
    status: targetStatus,
    location: location || '',
    notes: notes || `Shipment status updated to ${targetStatus}`,
    updatedBy: actorId,
    timestamp: new Date()
  });

  try {
    await AuditLog.create({
      action: `SHIPMENT_${targetStatus}`,
      category: 'LOGISTICS',
      entityId: shipment._id,
      entityType: 'Shipment',
      actorId,
      actorRole: actor?.role || 'LOGISTICS_COORDINATOR',
      previousState: { status: previousStatus },
      newState: { status: targetStatus, location },
      details: notes || `Shipment ${shipment.shipmentNumber || shipment._id} status is now ${targetStatus}`
    });
  } catch (err) {
    console.error('AuditLog creation failed during shipment transition:', err.message);
  }

  // Realtime Event Emission
  try {
    const buyerId = shipment.purchaseOrder?.buyerId || shipment.purchaseOrderId?.buyerId;
    const shipmentRooms = [
      ROOMS.allAdmins(),
      ROOMS.allLogistics(),
      buyerId ? ROOMS.buyer(buyerId) : null,
      buyerId ? ROOMS.user(buyerId) : null
    ].filter(Boolean);

    await emitRealtimeEvent(
      EVENT_TYPES.SHIPMENT_STATUS_CHANGED,
      {
        shipmentId: shipment._id,
        shipmentNumber: shipment.shipmentNumber,
        previousStatus,
        status: targetStatus,
        location
      },
      shipmentRooms,
      buyerId ? {
        userId: buyerId,
        type: 'SHIPMENT_UPDATE',
        title: `Shipment ${targetStatus}`,
        message: `Shipment #${shipment.shipmentNumber} is now ${targetStatus} (Location: ${location || 'In Transit'}).`,
        priority: targetStatus === 'DELIVERED' ? 'HIGH' : 'MEDIUM',
        entityType: 'Shipment',
        entityId: shipment._id
      } : null
    );
  } catch (err) {
    console.error('Realtime emit failed for shipment:', err.message);
  }

  return shipment;
};

module.exports = {
  ALLOWED_TRANSITIONS: ALLOWED_LOT_TRANSITIONS,
  ALLOWED_PO_TRANSITIONS,
  ALLOWED_SHIPMENT_TRANSITIONS,
  isValidTransition,
  assertValidTransition,
  isValidPOTransition,
  assertValidPOTransition,
  isValidShipmentTransition,
  assertValidShipmentTransition,
  transitionLot,
  transitionPurchaseOrder,
  transitionShipment
};
