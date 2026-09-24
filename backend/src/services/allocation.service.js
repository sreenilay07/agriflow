const LotAllocation = require('../models/LotAllocation');
const PurchaseOrder = require('../models/PurchaseOrder');
const Inventory = require('../models/Inventory');
const ProduceLot = require('../models/ProduceLot');
const InventoryMovement = require('../models/InventoryMovement');
const { PURCHASE_ORDER_STATUS, LOT_ALLOCATION_STATUS, PRODUCE_LOT_STATUS, INVENTORY_MOVEMENT_TYPE } = require('../constants/status');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');
const { transitionLot, transitionPurchaseOrder } = require('./stateMachine.service');
const AuditLog = require('../models/AuditLog');

const generateMovementNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = await InventoryMovement.countDocuments();
  const seq = String(count + 1).padStart(6, '0');
  return `MOV-${year}-${month}-${seq}`;
};

/**
 * Allocate a warehouse produce lot to a Purchase Order item
 */
const allocateLotToPO = async (data, actor) => {
  const { purchaseOrderId, purchaseOrderItemId, produceLotId, inventoryId, allocatedQuantityKg } = data;

  const qtyToAllocate = Number(allocatedQuantityKg);
  if (isNaN(qtyToAllocate) || qtyToAllocate <= 0) {
    throw new BadRequestError('Allocated quantity must be greater than zero kg.');
  }

  // 1. Fetch and validate Purchase Order
  const po = await PurchaseOrder.findById(purchaseOrderId);
  if (!po) {
    throw new NotFoundError('Purchase Order not found.');
  }

  if (
    ![
      PURCHASE_ORDER_STATUS.APPROVED,
      PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED,
      PURCHASE_ORDER_STATUS.FULLY_ALLOCATED
    ].includes(po.status)
  ) {
    throw new BadRequestError(`Cannot allocate lots to PO in status '${po.status}'. PO must be APPROVED.`);
  }

  const poItem = po.items.id(purchaseOrderItemId);
  if (!poItem) {
    throw new NotFoundError('Purchase Order item not found.');
  }

  const remainingNeeded = poItem.requestedQuantityKg - (poItem.allocatedQuantityKg || 0);
  if (qtyToAllocate > remainingNeeded) {
    throw new BadRequestError(
      `Cannot allocate ${qtyToAllocate} kg. Item only requires ${remainingNeeded} kg to fulfill.`
    );
  }

  // 2. Fetch and validate Inventory
  let inventory = await Inventory.findById(inventoryId);
  if (!inventory) {
    throw new NotFoundError('Warehouse inventory batch not found.');
  }

  // Support both canonical and legacy attributes
  const availQty = typeof inventory.availableQuantity === 'number' ? inventory.availableQuantity : (inventory.availableQuantityKg || 0);
  const isValidStatus = ['IN_STOCK', 'AVAILABLE'].includes(inventory.status);

  if (!isValidStatus || availQty < qtyToAllocate) {
    throw new BadRequestError(
      `Insufficient available inventory. Available: ${availQty} kg, requested: ${qtyToAllocate} kg.`
    );
  }

  // 3. Fetch and validate ProduceLot
  const lot = await ProduceLot.findById(produceLotId);
  if (!lot) {
    throw new NotFoundError('Produce lot not found.');
  }

  if (![PRODUCE_LOT_STATUS.STORED, PRODUCE_LOT_STATUS.ALLOCATED].includes(lot.status)) {
    throw new BadRequestError(`Cannot allocate lot in status '${lot.status}'. Lot must be STORED.`);
  }

  // 4. Create LotAllocation
  const totalAmount = Number((qtyToAllocate * poItem.agreedUnitPricePerKg).toFixed(2));
  const allocation = await LotAllocation.create({
    purchaseOrder: po._id,
    purchaseOrderItemId: poItem._id,
    produceLot: lot._id,
    inventory: inventory._id,
    warehouse: inventory.warehouseId || inventory.warehouse,
    allocatedQuantityKg: qtyToAllocate,
    unitPricePerKg: poItem.agreedUnitPricePerKg,
    totalAmount,
    status: LOT_ALLOCATION_STATUS.ALLOCATED,
    allocatedBy: actor._id,
    allocatedAt: new Date()
  });

  // 5. Update Inventory (atomic reservation)
  const newAvail = availQty - qtyToAllocate;
  inventory.availableQuantity = newAvail;
  inventory.availableQuantityKg = newAvail;
  inventory.reservedQuantity = (inventory.reservedQuantity || 0) + qtyToAllocate;
  inventory.reservedQuantityKg = inventory.reservedQuantity;

  if (newAvail === 0) {
    inventory.status = 'RESERVED';
  }
  await inventory.save();

  // Log inventory movement
  const movNumber = await generateMovementNumber();
  await InventoryMovement.create({
    movementNumber: movNumber,
    inventoryId: inventory._id,
    lotId: lot._id,
    warehouseId: inventory.warehouseId || inventory.warehouse,
    cropId: lot.cropId,
    movementType: INVENTORY_MOVEMENT_TYPE.RESERVATION,
    quantity: qtyToAllocate,
    unit: inventory.unit || 'KG',
    source: inventory.storageLocation || inventory.storageBay || 'Storage Bay',
    destination: `Reserved for PO ${po.poNumber}`,
    performedBy: actor._id,
    reason: `Reserved ${qtyToAllocate} kg for PO ${po.poNumber}`
  });

  // 6. Update Lot status to ALLOCATED
  if (lot.status !== PRODUCE_LOT_STATUS.ALLOCATED) {
    await transitionLot(lot, PRODUCE_LOT_STATUS.ALLOCATED, actor, `Allocated ${qtyToAllocate} kg to PO ${po.poNumber}`);
    await lot.save();
  }

  // 7. Update Purchase Order quantities and status
  poItem.allocatedQuantityKg = (poItem.allocatedQuantityKg || 0) + qtyToAllocate;
  po.allocatedQuantityKg = (po.allocatedQuantityKg || 0) + qtyToAllocate;

  const isFullyAllocated = po.items.every((item) => item.allocatedQuantityKg >= item.requestedQuantityKg);
  const targetPOStatus = isFullyAllocated
    ? PURCHASE_ORDER_STATUS.FULLY_ALLOCATED
    : PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED;

  await transitionPurchaseOrder(po, targetPOStatus, actor, `Allocated ${qtyToAllocate} kg from lot ${lot.lotNumber}`);
  await po.save();

  return {
    allocation,
    purchaseOrder: po,
    inventory
  };
};

/**
 * Cancel a lot allocation and release reserved inventory
 */
const cancelAllocation = async (allocationId, reason, actor) => {
  const allocation = await LotAllocation.findById(allocationId);
  if (!allocation) {
    throw new NotFoundError('Allocation record not found.');
  }

  if (allocation.status !== LOT_ALLOCATION_STATUS.ALLOCATED) {
    throw new BadRequestError(`Cannot cancel allocation in status '${allocation.status}'.`);
  }

  // 1. Release inventory
  const inventory = await Inventory.findById(allocation.inventory);
  if (inventory) {
    const curRes = typeof inventory.reservedQuantity === 'number' ? inventory.reservedQuantity : (inventory.reservedQuantityKg || 0);
    const curAvail = typeof inventory.availableQuantity === 'number' ? inventory.availableQuantity : (inventory.availableQuantityKg || 0);

    const newRes = Math.max(0, curRes - allocation.allocatedQuantityKg);
    const newAvail = curAvail + allocation.allocatedQuantityKg;

    inventory.reservedQuantity = newRes;
    inventory.reservedQuantityKg = newRes;
    inventory.availableQuantity = newAvail;
    inventory.availableQuantityKg = newAvail;
    inventory.status = 'IN_STOCK';
    await inventory.save();

    const movNumber = await generateMovementNumber();
    await InventoryMovement.create({
      movementNumber: movNumber,
      inventoryId: inventory._id,
      lotId: allocation.produceLot,
      warehouseId: inventory.warehouseId || inventory.warehouse,
      cropId: inventory.cropId,
      movementType: INVENTORY_MOVEMENT_TYPE.ADJUSTMENT,
      quantity: allocation.allocatedQuantityKg,
      unit: inventory.unit || 'KG',
      source: 'Reserved Allocation',
      destination: inventory.storageLocation || inventory.storageBay || 'Storage Bay',
      performedBy: actor._id,
      reason: `Released ${allocation.allocatedQuantityKg} kg from cancelled allocation: ${reason || 'Manual cancellation'}`
    });
  }

  // 2. Update allocation status
  allocation.status = LOT_ALLOCATION_STATUS.CANCELLED;
  allocation.cancellationReason = reason || 'Cancelled by manager';
  allocation.cancelledBy = actor._id;
  allocation.cancelledAt = new Date();
  await allocation.save();

  // 3. Update Purchase Order
  const po = await PurchaseOrder.findById(allocation.purchaseOrder);
  if (po) {
    const poItem = po.items.id(allocation.purchaseOrderItemId);
    if (poItem) {
      poItem.allocatedQuantityKg = Math.max(0, (poItem.allocatedQuantityKg || 0) - allocation.allocatedQuantityKg);
    }
    po.allocatedQuantityKg = Math.max(0, (po.allocatedQuantityKg || 0) - allocation.allocatedQuantityKg);

    const targetPOStatus =
      po.allocatedQuantityKg > 0 ? PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED : PURCHASE_ORDER_STATUS.APPROVED;

    await transitionPurchaseOrder(po, targetPOStatus, actor, `Cancelled allocation ${allocation._id}`);
    await po.save();
  }

  // 4. If no other active allocations on produce lot, return lot status to STORED
  const otherActiveAllocations = await LotAllocation.countDocuments({
    produceLot: allocation.produceLot,
    status: LOT_ALLOCATION_STATUS.ALLOCATED
  });

  if (otherActiveAllocations === 0) {
    const lot = await ProduceLot.findById(allocation.produceLot);
    if (lot && lot.status === PRODUCE_LOT_STATUS.ALLOCATED) {
      await transitionLot(lot, PRODUCE_LOT_STATUS.STORED, actor, 'Returned to STORED after allocation cancellation');
      await lot.save();
    }
  }

  return allocation;
};

/**
 * List allocations by PO or warehouse
 */
const getAllocations = async (query = {}) => {
  const filter = {};
  if (query.purchaseOrderId) filter.purchaseOrder = query.purchaseOrderId;
  if (query.produceLotId) filter.produceLot = query.produceLotId;
  if (query.warehouseId) filter.warehouse = query.warehouseId;
  if (query.status) filter.status = query.status;

  const allocations = await LotAllocation.find(filter)
    .populate('purchaseOrder', 'poNumber status totalQuantityKg')
    .populate('produceLot', 'lotNumber cropId declaredQuantity receivedQuantity status')
    .populate('warehouse', 'name location')
    .populate('inventory', 'batchNumber grade availableQuantity')
    .sort({ createdAt: -1 })
    .lean();

  return allocations;
};

module.exports = {
  allocateLotToPO,
  cancelAllocation,
  getAllocations
};
