const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess } = require('../utils/responseHandler');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const inventoryService = require('../services/inventory.service');

const router = express.Router();

router.use(protect);

/**
 * @route POST /api/v1/inventory/store-lot
 * @desc Store accepted produce lot into warehouse stock
 */
router.post(
  '/store-lot',
  requireRole(ROLES.CENTER_OPERATOR, ROLES.PROCUREMENT_OFFICER, ROLES.CENTRE_MANAGER, ROLES.SUPER_ADMIN),
  asyncWrapper(async (req, res) => {
    const { lotId, ...data } = req.body;
    const result = await inventoryService.storeAcceptedLot(lotId, data, req.user);
    return sendSuccess(res, 'Produce lot successfully moved into warehouse inventory', result, 201);
  })
);

/**
 * @route POST /api/v1/inventory/transfer
 * @desc Transfer inventory to another warehouse
 */
router.post(
  '/transfer',
  requireRole(ROLES.CENTRE_MANAGER, ROLES.SUPER_ADMIN),
  asyncWrapper(async (req, res) => {
    const { inventoryId, ...data } = req.body;
    const result = await inventoryService.transferInventory(inventoryId, data, req.user);
    return sendSuccess(res, 'Inventory transfer completed', result);
  })
);

/**
 * @route GET /api/v1/inventory/warehouse/:warehouseId
 * @desc Get inventory for a warehouse
 */
router.get('/warehouse/:warehouseId', asyncWrapper(async (req, res) => {
  const items = await inventoryService.getWarehouseInventory(req.params.warehouseId, req.query);
  return sendSuccess(res, 'Warehouse inventory items retrieved', items);
}));

/**
 * @route GET /api/v1/inventory/movements
 * @desc List inventory movement history
 */
router.get('/movements', asyncWrapper(async (req, res) => {
  const movements = await inventoryService.getInventoryMovements(req.query);
  return sendSuccess(res, 'Inventory movements retrieved', movements);
}));

module.exports = router;
