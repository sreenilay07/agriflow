const Inventory = require('../models/Inventory');
const InventoryMovement = require('../models/InventoryMovement');
const Warehouse = require('../models/Warehouse');
const ProduceLot = require('../models/ProduceLot');
const QualityInspection = require('../models/QualityInspection');
const { PRODUCE_LOT_STATUS, INVENTORY_MOVEMENT_TYPE } = require('../constants/status');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');
const { transitionLot } = require('./stateMachine.service');

/**
 * Generate a unique batch number (BAT-YYYY-MM-XXXXXX)
 */
const generateBatchNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = await Inventory.countDocuments();
  const seq = String(count + 1).padStart(6, '0');
  return `BAT-${year}-${month}-${seq}`;
};

/**
 * Generate a unique movement number (MOV-YYYY-MM-XXXXXX)
 */
const generateMovementNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const count = await InventoryMovement.countDocuments();
  const seq = String(count + 1).padStart(6, '0');
  return `MOV-${year}-${month}-${seq}`;
};

/**
 * Store an accepted produce lot into warehouse inventory
 */
const storeAcceptedLot = async (lotId, data, actorUser) => {
  const { warehouseId, storageLocation } = data;

  const lot = await ProduceLot.findById(lotId).populate('cropId');
  if (!lot) {
    throw new NotFoundError('Produce lot not found.');
  }

  if (lot.status !== PRODUCE_LOT_STATUS.ACCEPTED) {
    throw new BadRequestError(
      `Cannot store lot in status '${lot.status}'. Lot must be in ACCEPTED status.`
    );
  }

  if (!lot.acceptedQuantity || lot.acceptedQuantity <= 0) {
    throw new BadRequestError('Accepted quantity is zero. Cannot store zero inventory.');
  }

  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse || warehouse.status !== 'ACTIVE') {
    throw new BadRequestError('Selected warehouse is invalid or inactive.');
  }

  // Validate warehouse capacity
  const remainingCapacity = warehouse.totalCapacityKg - (warehouse.usedCapacityKg || 0);
  if (lot.acceptedQuantity > remainingCapacity) {
    throw new BadRequestError(
      `Warehouse capacity exceeded. Available: ${remainingCapacity} kg, Required: ${lot.acceptedQuantity} kg.`
    );
  }

  // Check if inventory already exists for this lot
  let inventory = await Inventory.findOne({ lotId: lot._id });
  if (inventory) {
    throw new BadRequestError('Inventory entry already exists for this produce lot.');
  }

  // Retrieve grade from inspection if available
  let grade = 'GRADE_A';
  if (lot.qualityInspectionId) {
    const inspection = await QualityInspection.findById(lot.qualityInspectionId);
    if (inspection) {
      grade = inspection.assignedGrade;
    }
  }

  const batchNumber = await generateBatchNumber();

  inventory = new Inventory({
    warehouseId: warehouse._id,
    cropId: lot.cropId._id || lot.cropId,
    lotId: lot._id,
    batchNumber,
    grade,
    totalQuantity: lot.acceptedQuantity,
    availableQuantity: lot.acceptedQuantity,
    reservedQuantity: 0,
    unit: lot.unit || 'KG',
    status: 'IN_STOCK',
    storageLocation: storageLocation || 'Bay-A1'
  });

  await inventory.save();

  // Update warehouse capacity
  warehouse.usedCapacityKg = (warehouse.usedCapacityKg || 0) + lot.acceptedQuantity;
  await warehouse.save();

  // Record inventory movement
  const movementNumber = await generateMovementNumber();
  const movement = new InventoryMovement({
    movementNumber,
    movementType: INVENTORY_MOVEMENT_TYPE.RECEIPT,
    inventoryId: inventory._id,
    lotId: lot._id,
    warehouseId: warehouse._id,
    cropId: lot.cropId._id || lot.cropId,
    quantity: lot.acceptedQuantity,
    unit: lot.unit || 'KG',
    source: `Collection Centre (${lot.collectionCentreId || 'Procurement Intake'})`,
    destination: `${warehouse.name} (${inventory.storageLocation})`,
    performedBy: actorUser._id,
    reason: `Initial warehouse intake for lot ${lot.lotNumber}`,
    referenceId: batchNumber
  });

  await movement.save();

  // Link warehouse to lot and transition state to STORED
  lot.warehouseId = warehouse._id;
  await transitionLot(
    lot,
    PRODUCE_LOT_STATUS.STORED,
    actorUser,
    `Stored in warehouse ${warehouse.name} under batch ${batchNumber}`,
    { warehouseId: warehouse._id, batchNumber, storageLocation: inventory.storageLocation }
  );

  return { inventory, movement, lot };
};

/**
 * Transfer inventory to another warehouse
 */
const transferInventory = async (inventoryId, data, actorUser) => {
  const { targetWarehouseId, transferQuantity, reason } = data;

  const inventory = await Inventory.findById(inventoryId).populate('warehouseId');
  if (!inventory) {
    throw new NotFoundError('Inventory record not found.');
  }

  const quantity = Number(transferQuantity);
  if (isNaN(quantity) || quantity <= 0) {
    throw new BadRequestError('Transfer quantity must be greater than 0.');
  }

  if (quantity > inventory.availableQuantity) {
    throw new BadRequestError(
      `Insufficient available inventory. Requested: ${quantity} kg, Available: ${inventory.availableQuantity} kg.`
    );
  }

  const targetWarehouse = await Warehouse.findById(targetWarehouseId);
  if (!targetWarehouse || targetWarehouse.status !== 'ACTIVE') {
    throw new BadRequestError('Target warehouse is invalid or inactive.');
  }

  const targetCapacity = targetWarehouse.totalCapacityKg - (targetWarehouse.usedCapacityKg || 0);
  if (quantity > targetCapacity) {
    throw new BadRequestError(`Target warehouse capacity exceeded. Remaining space: ${targetCapacity} kg.`);
  }

  // Update source inventory & warehouse
  inventory.availableQuantity -= quantity;
  inventory.totalQuantity -= quantity;
  if (inventory.totalQuantity <= 0) {
    inventory.status = 'DISPATCHED';
  }
  await inventory.save();

  inventory.warehouseId.usedCapacityKg = Math.max(0, inventory.warehouseId.usedCapacityKg - quantity);
  await inventory.warehouseId.save();

  // Update target warehouse
  targetWarehouse.usedCapacityKg = (targetWarehouse.usedCapacityKg || 0) + quantity;
  await targetWarehouse.save();

  // Create destination inventory item
  const newBatchNumber = await generateBatchNumber();
  const targetInventory = new Inventory({
    warehouseId: targetWarehouse._id,
    cropId: inventory.cropId,
    lotId: inventory.lotId,
    batchNumber: newBatchNumber,
    grade: inventory.grade,
    totalQuantity: quantity,
    availableQuantity: quantity,
    reservedQuantity: 0,
    unit: inventory.unit,
    status: 'IN_STOCK',
    storageLocation: 'Transferred Stock'
  });
  await targetInventory.save();

  // Record movement
  const movementNumber = await generateMovementNumber();
  const movement = new InventoryMovement({
    movementNumber,
    movementType: INVENTORY_MOVEMENT_TYPE.TRANSFER,
    inventoryId: inventory._id,
    lotId: inventory.lotId,
    warehouseId: inventory.warehouseId._id,
    destinationWarehouseId: targetWarehouse._id,
    cropId: inventory.cropId,
    quantity,
    unit: inventory.unit,
    source: inventory.warehouseId.name,
    destination: targetWarehouse.name,
    performedBy: actorUser._id,
    reason: reason || 'Inter-warehouse stock transfer',
    referenceId: newBatchNumber
  });
  await movement.save();

  return { sourceInventory: inventory, targetInventory, movement };
};

/**
 * Get warehouse inventory list
 */
const getWarehouseInventory = async (warehouseId, query = {}) => {
  const filter = { warehouseId };
  if (query.cropId) filter.cropId = query.cropId;
  if (query.grade) filter.grade = query.grade;
  if (query.status) filter.status = query.status;

  const items = await Inventory.find(filter)
    .populate('cropId', 'name code unit')
    .populate('lotId', 'lotNumber declaredQuantity acceptedQuantity')
    .populate('warehouseId', 'name code')
    .sort({ createdAt: -1 });

  return items;
};

/**
 * Get movement history
 */
const getInventoryMovements = async (query = {}) => {
  const filter = {};
  if (query.warehouseId) filter.warehouseId = query.warehouseId;
  if (query.lotId) filter.lotId = query.lotId;
  if (query.movementType) filter.movementType = query.movementType;

  const movements = await InventoryMovement.find(filter)
    .populate('warehouseId', 'name code')
    .populate('cropId', 'name code')
    .populate('performedBy', 'fullName role')
    .sort({ createdAt: -1 });

  return movements;
};

module.exports = {
  generateBatchNumber,
  generateMovementNumber,
  storeAcceptedLot,
  transferInventory,
  getWarehouseInventory,
  getInventoryMovements
};
