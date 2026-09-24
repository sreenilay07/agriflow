const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');
const DeliveryConfirmation = require('../models/DeliveryConfirmation');
const PurchaseOrder = require('../models/PurchaseOrder');
const LotAllocation = require('../models/LotAllocation');
const ProduceLot = require('../models/ProduceLot');
const Inventory = require('../models/Inventory');
const InventoryMovement = require('../models/InventoryMovement');
const Notification = require('../models/Notification');
const {
  SHIPMENT_STATUS,
  PURCHASE_ORDER_STATUS,
  LOT_ALLOCATION_STATUS,
  PRODUCE_LOT_STATUS,
  VEHICLE_STATUS,
  INVENTORY_MOVEMENT_TYPE,
  DELIVERY_CONDITION
} = require('../constants/status');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');
const { transitionShipment, transitionPurchaseOrder, transitionLot } = require('./stateMachine.service');

/**
 * Generate sequential shipment number: SHP-YYYY-XXXXXX
 */
const generateShipmentNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `SHP-${currentYear}-`;

  const latestShipment = await Shipment.findOne({
    shipmentNumber: { $regex: new RegExp(`^${prefix}`) }
  })
    .sort({ createdAt: -1 })
    .lean();

  let nextSeq = 1;
  if (latestShipment && latestShipment.shipmentNumber) {
    const parts = latestShipment.shipmentNumber.split('-');
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
 * Register / create a fleet vehicle
 */
const createVehicle = async (data) => {
  const { vehicleNumber, type, capacityKg, transporterName, driverName, driverPhone, driverLicenseNumber } = data;

  if (!vehicleNumber || !capacityKg || !driverName || !driverPhone) {
    throw new BadRequestError('Vehicle registration number, capacity, driver name, and driver phone are required.');
  }

  const existing = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase().trim() });
  if (existing) {
    throw new BadRequestError(`Vehicle ${vehicleNumber.toUpperCase()} is already registered in the system.`);
  }

  const vehicle = await Vehicle.create({
    vehicleNumber: vehicleNumber.toUpperCase().trim(),
    type: type || 'HEAVY_TRUCK_10T',
    capacityKg: Number(capacityKg),
    transporterName: transporterName || '',
    driverName,
    driverPhone,
    driverLicenseNumber: driverLicenseNumber || '',
    status: VEHICLE_STATUS.ACTIVE
  });

  return vehicle;
};

/**
 * List vehicles
 */
const getVehicles = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;

  const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 }).lean();
  return vehicles;
};

/**
 * Create a new shipment from PO allocations
 */
const createShipment = async (data, actor) => {
  const { purchaseOrderId, allocationIds, vehicleId, plannedDispatchDate, estimatedArrivalDate, manifestNotes, notes } = data;

  const po = await PurchaseOrder.findById(purchaseOrderId);
  if (!po) {
    throw new NotFoundError('Purchase Order not found.');
  }

  if (
    ![
      PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED,
      PURCHASE_ORDER_STATUS.FULLY_ALLOCATED,
      PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH
    ].includes(po.status)
  ) {
    throw new BadRequestError(`Cannot create shipment for PO in status '${po.status}'.`);
  }

  if (!allocationIds || !Array.isArray(allocationIds) || allocationIds.length === 0) {
    throw new BadRequestError('At least one lot allocation must be included in the shipment.');
  }

  const allocations = await LotAllocation.find({
    _id: { $in: allocationIds },
    purchaseOrder: po._id,
    status: LOT_ALLOCATION_STATUS.ALLOCATED
  }).populate('produceLot');

  if (allocations.length === 0) {
    throw new BadRequestError('No valid active allocations found for this shipment.');
  }

  const totalWeightKg = allocations.reduce((sum, a) => sum + a.allocatedQuantityKg, 0);

  // Validate Vehicle
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new NotFoundError('Vehicle not found.');
  }

  if (vehicle.status !== VEHICLE_STATUS.ACTIVE) {
    throw new BadRequestError(`Vehicle ${vehicle.vehicleNumber} is not active (status: ${vehicle.status}).`);
  }

  if (vehicle.currentShipment) {
    const activeShipment = await Shipment.findById(vehicle.currentShipment);
    if (activeShipment && ![SHIPMENT_STATUS.DELIVERED, SHIPMENT_STATUS.CANCELLED].includes(activeShipment.status)) {
      throw new BadRequestError(
        `Vehicle ${vehicle.vehicleNumber} is currently assigned to active shipment ${activeShipment.shipmentNumber}.`
      );
    }
  }

  if (vehicle.capacityKg < totalWeightKg) {
    throw new BadRequestError(
      `Shipment weight (${totalWeightKg} kg) exceeds vehicle capacity (${vehicle.capacityKg} kg).`
    );
  }

  const shipmentNumber = await generateShipmentNumber();
  const originWarehouseId = allocations[0].warehouse;

  const shipment = await Shipment.create({
    shipmentNumber,
    purchaseOrder: po._id,
    allocations: allocations.map((a) => a._id),
    originWarehouse: originWarehouseId,
    destinationAddress: po.deliveryAddress,
    vehicle: vehicle._id,
    driverName: vehicle.driverName,
    driverPhone: vehicle.driverPhone,
    totalWeightKg,
    status: SHIPMENT_STATUS.READY_FOR_DISPATCH,
    plannedDispatchDate: plannedDispatchDate ? new Date(plannedDispatchDate) : new Date(),
    estimatedArrivalDate: estimatedArrivalDate ? new Date(estimatedArrivalDate) : null,
    manifest: {
      goodsDescription: 'Agricultural Bulk Produce',
      lotNumbers: allocations.map((a) => a.produceLot?.lotNumber).filter(Boolean),
      totalBags: Math.ceil(totalWeightKg / 50),
      weighbridgeSlipNumber: `WB-${Date.now().toString().slice(-6)}`
    },
    notes: notes || manifestNotes || '',
    trackingEvents: [
      {
        status: SHIPMENT_STATUS.READY_FOR_DISPATCH,
        location: 'Origin Warehouse Loading Bay',
        notes: `Shipment registered. Assigned to vehicle ${vehicle.vehicleNumber} (${vehicle.driverName})`,
        updatedBy: actor._id,
        timestamp: new Date()
      }
    ]
  });

  // Assign shipment to vehicle
  vehicle.currentShipment = shipment._id;
  await vehicle.save();

  // Advance PO state if not already dispatched
  if (po.status !== PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH) {
    await transitionPurchaseOrder(po, PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH, actor, `Shipment ${shipmentNumber} created`);
    await po.save();
  }

  return shipment;
};

/**
 * Dispatch a shipment
 */
const dispatchShipment = async (shipmentId, actor, notes = '') => {
  const shipment = await Shipment.findById(shipmentId).populate('allocations');
  if (!shipment) {
    throw new NotFoundError('Shipment not found.');
  }

  if (![SHIPMENT_STATUS.PLANNED, SHIPMENT_STATUS.READY_FOR_DISPATCH].includes(shipment.status)) {
    throw new BadRequestError(`Cannot dispatch shipment in status '${shipment.status}'.`);
  }

  shipment.actualDispatchDate = new Date();
  shipment.dispatchedBy = actor._id;

  await transitionShipment(
    shipment,
    SHIPMENT_STATUS.DISPATCHED,
    actor,
    'Origin Warehouse Gate',
    notes || 'Vehicle passed outbound weighbridge and security checkpoint'
  );
  await shipment.save();

  // Update allocations, inventory movements, and produce lots
  for (const allocation of shipment.allocations) {
    allocation.status = LOT_ALLOCATION_STATUS.DISPATCHED;
    await allocation.save();

    const lot = await ProduceLot.findById(allocation.produceLot);
    if (lot && lot.status === PRODUCE_LOT_STATUS.ALLOCATED) {
      await transitionLot(lot, PRODUCE_LOT_STATUS.DISPATCHED, actor, `Dispatched via shipment ${shipment.shipmentNumber}`);
      await lot.save();
    }

    // Log inventory dispatch movement
    await InventoryMovement.create({
      inventory: allocation.inventory,
      produceLot: allocation.produceLot,
      warehouse: shipment.originWarehouse,
      movementType: INVENTORY_MOVEMENT_TYPE.DISPATCH,
      quantityKg: allocation.allocatedQuantityKg,
      sourceLocation: 'Reserved Allocation',
      destinationLocation: `In Transit to ${shipment.destinationAddress?.district || 'Buyer Facility'}`,
      performedBy: actor._id,
      notes: `Dispatched ${allocation.allocatedQuantityKg} kg on shipment ${shipment.shipmentNumber}`
    });
  }

  // Update Purchase Order status
  const po = await PurchaseOrder.findById(shipment.purchaseOrder);
  if (po) {
    await transitionPurchaseOrder(po, PURCHASE_ORDER_STATUS.DISPATCHED, actor, `Dispatched on shipment ${shipment.shipmentNumber}`);
    await po.save();

    // Notify Buyer
    try {
      await Notification.create({
        userId: po.buyer,
        title: 'Shipment Dispatched',
        message: `Shipment ${shipment.shipmentNumber} containing ${shipment.totalWeightKg} kg has been dispatched on vehicle ${shipment.vehicle}.`,
        type: 'QUEUE',
        metadata: { shipmentId: shipment._id, poId: po._id }
      });
    } catch (err) {
      console.error('Notification error:', err.message);
    }
  }

  return shipment;
};

/**
 * Update transit status milestone (IN_TRANSIT, DELAYED, ARRIVED)
 */
const updateTransitStatus = async (shipmentId, status, location, notes, actor) => {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    throw new NotFoundError('Shipment not found.');
  }

  await transitionShipment(shipment, status, actor, location, notes);
  await shipment.save();

  return shipment;
};

/**
 * Confirm delivery receipt and record weighment / discrepancies
 */
const confirmDelivery = async (data, actor) => {
  const { shipmentId, deliveredQuantityKg, condition, receiverName, receiverPhone, notes, discrepancyReason } = data;

  const shipment = await Shipment.findById(shipmentId).populate('allocations');
  if (!shipment) {
    throw new NotFoundError('Shipment not found.');
  }

  if (![SHIPMENT_STATUS.DISPATCHED, SHIPMENT_STATUS.IN_TRANSIT, SHIPMENT_STATUS.ARRIVED].includes(shipment.status)) {
    throw new BadRequestError(`Cannot confirm delivery for shipment in status '${shipment.status}'.`);
  }

  const deliveredQty = Number(deliveredQuantityKg);
  if (isNaN(deliveredQty) || deliveredQty < 0) {
    throw new BadRequestError('Delivered quantity must be a valid positive number.');
  }

  if (deliveredQty > shipment.totalWeightKg) {
    throw new BadRequestError(
      `Delivered quantity (${deliveredQty} kg) cannot exceed dispatched weight (${shipment.totalWeightKg} kg).`
    );
  }

  const discrepancyKg = shipment.totalWeightKg - deliveredQty;

  // 1. Create Delivery Confirmation Record
  const confirmation = await DeliveryConfirmation.create({
    shipment: shipment._id,
    purchaseOrder: shipment.purchaseOrder,
    dispatchedQuantityKg: shipment.totalWeightKg,
    deliveredQuantityKg: deliveredQty,
    discrepancyKg,
    discrepancyReason: discrepancyReason || '',
    condition: condition || DELIVERY_CONDITION.EXCELLENT,
    receiverName,
    receiverPhone: receiverPhone || '',
    notes: notes || '',
    confirmedBy: actor._id,
    confirmedAt: new Date()
  });

  // 2. Transition Shipment to DELIVERED
  shipment.actualDeliveryDate = new Date();
  await transitionShipment(
    shipment,
    SHIPMENT_STATUS.DELIVERED,
    actor,
    'Destination Facility Gate',
    `Delivery confirmed by ${receiverName}. Received: ${deliveredQty} kg (${condition || 'EXCELLENT'}).`
  );
  await shipment.save();

  // Release vehicle
  const vehicle = await Vehicle.findById(shipment.vehicle);
  if (vehicle) {
    vehicle.currentShipment = null;
    await vehicle.save();
  }

  // 3. Update Allocations and Produce Lots
  for (const allocation of shipment.allocations) {
    allocation.status = LOT_ALLOCATION_STATUS.DELIVERED;
    await allocation.save();

    const lot = await ProduceLot.findById(allocation.produceLot);
    if (lot && lot.status === PRODUCE_LOT_STATUS.DISPATCHED) {
      await transitionLot(lot, PRODUCE_LOT_STATUS.DELIVERED, actor, `Delivered to buyer on shipment ${shipment.shipmentNumber}`);
      await lot.save();
    }
  }

  // 4. Update Purchase Order and check completion
  const po = await PurchaseOrder.findById(shipment.purchaseOrder);
  if (po) {
    po.deliveredQuantityKg = (po.deliveredQuantityKg || 0) + deliveredQty;

    const isFullyDelivered = po.deliveredQuantityKg >= po.totalQuantityKg;
    const targetPOStatus = isFullyDelivered ? PURCHASE_ORDER_STATUS.COMPLETED : PURCHASE_ORDER_STATUS.PARTIALLY_DELIVERED;

    await transitionPurchaseOrder(
      po,
      targetPOStatus,
      actor,
      `Delivery confirmation recorded for ${deliveredQty} kg.`
    );
    await po.save();

    // Notify Buyer and Admins
    try {
      await Notification.create({
        userId: po.buyer,
        title: isFullyDelivered ? 'Purchase Order Completed' : 'Partial Delivery Recorded',
        message: `Delivery confirmed for ${deliveredQty} kg on PO ${po.poNumber}. Condition: ${condition || 'EXCELLENT'}.`,
        type: 'PAYMENT',
        metadata: { poId: po._id, shipmentId: shipment._id }
      });
    } catch (err) {
      console.error('Notification error:', err.message);
    }
  }

  return {
    confirmation,
    shipment,
    purchaseOrder: po
  };
};

/**
 * List shipments with filtering & pagination
 */
const getShipments = async (query = {}, user) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.purchaseOrderId) filter.purchaseOrder = query.purchaseOrderId;
  if (query.vehicleId) filter.vehicle = query.vehicleId;

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [shipments, total] = await Promise.all([
    Shipment.find(filter)
      .populate('purchaseOrder', 'poNumber buyer status totalQuantityKg')
      .populate('vehicle', 'vehicleNumber type capacityKg transporterName driverName driverPhone')
      .populate('originWarehouse', 'name location district')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Shipment.countDocuments(filter)
  ]);

  return {
    shipments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get detailed shipment by ID
 */
const getShipmentDetail = async (shipmentId) => {
  const shipment = await Shipment.findById(shipmentId)
    .populate({
      path: 'purchaseOrder',
      populate: {
        path: 'buyerProfile'
      }
    })
    .populate('vehicle')
    .populate('originWarehouse')
    .populate({
      path: 'allocations',
      populate: [
        {
          path: 'produceLot',
          select: 'lotNumber crop declaredQuantity receivedQuantity status farmer',
          populate: {
            path: 'farmer',
            select: 'fullName district'
          }
        },
        {
          path: 'inventory',
          select: 'batchNumber qualityGrade'
        }
      ]
    })
    .lean();

  if (!shipment) {
    throw new NotFoundError('Shipment not found.');
  }

  const deliveryConfirmation = await DeliveryConfirmation.findOne({ shipment: shipment._id }).lean();

  return {
    ...shipment,
    deliveryConfirmation
  };
};

/**
 * Get logistics dashboard statistics
 */
const getLogisticsDashboardMetrics = async () => {
  const [readyForDispatch, inTransit, deliveredToday, delayed, totalVehicles, activeVehicles] = await Promise.all([
    Shipment.countDocuments({ status: SHIPMENT_STATUS.READY_FOR_DISPATCH }),
    Shipment.countDocuments({ status: { $in: [SHIPMENT_STATUS.DISPATCHED, SHIPMENT_STATUS.IN_TRANSIT] } }),
    Shipment.countDocuments({
      status: SHIPMENT_STATUS.DELIVERED,
      actualDeliveryDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    }),
    Shipment.countDocuments({ status: SHIPMENT_STATUS.DELAYED }),
    Vehicle.countDocuments(),
    Vehicle.countDocuments({ status: VEHICLE_STATUS.ACTIVE })
  ]);

  return {
    readyForDispatch,
    inTransit,
    deliveredToday,
    delayed,
    totalVehicles,
    activeVehicles
  };
};

module.exports = {
  createVehicle,
  getVehicles,
  createShipment,
  dispatchShipment,
  updateTransitStatus,
  confirmDelivery,
  getShipments,
  getShipmentDetail,
  getLogisticsDashboardMetrics,
  generateShipmentNumber
};
