const express = require('express');
const Warehouse = require('../models/Warehouse');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess } = require('../utils/responseHandler');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');

const router = express.Router();

router.use(protect);

/**
 * @route GET /api/v1/warehouses
 * @desc List active warehouses
 */
router.get('/', asyncWrapper(async (req, res) => {
  const filter = {};
  if (req.query.centreId) filter.centreId = req.query.centreId;
  if (req.query.districtId) filter.districtId = req.query.districtId;

  let warehouses = await Warehouse.find(filter).populate('centreId', 'name code district').sort({ name: 1 });
  if (!warehouses || warehouses.length === 0) {
    const defaultWarehouses = [
      { name: 'Warangal Regional Storage Hub', code: 'WH-WGL-01', totalCapacityKg: 500000, usedCapacityKg: 45000, status: 'ACTIVE' },
      { name: 'Nizamabad Central Agro Warehouse', code: 'WH-NZB-01', totalCapacityKg: 800000, usedCapacityKg: 120000, status: 'ACTIVE' },
      { name: 'Hyderabad North Grain Storage', code: 'WH-HYD-01', totalCapacityKg: 1000000, usedCapacityKg: 250000, status: 'ACTIVE' }
    ];
    await Warehouse.insertMany(defaultWarehouses);
    warehouses = await Warehouse.find(filter).sort({ name: 1 });
  }

  return sendSuccess(res, 'Warehouses retrieved', warehouses);
}));

/**
 * @route POST /api/v1/warehouses
 * @desc Create a warehouse (Admin / Manager)
 */
router.post(
  '/',
  requireRole(ROLES.CENTRE_MANAGER, ROLES.SUPER_ADMIN),
  asyncWrapper(async (req, res) => {
    const { name, code, totalCapacityKg, centreId, districtId, address } = req.body;

    const existing = await Warehouse.findOne({ code: code.toUpperCase() });
    if (existing) {
      throw new BadRequestError('Warehouse with this code already exists.');
    }

    const warehouse = new Warehouse({
      name,
      code: code.toUpperCase(),
      totalCapacityKg: Number(totalCapacityKg),
      centreId: centreId || null,
      districtId: districtId || null,
      address: address || ''
    });

    await warehouse.save();
    return sendSuccess(res, 'Warehouse registered successfully', warehouse, 201);
  })
);

/**
 * @route GET /api/v1/warehouses/:id
 * @desc Get warehouse details
 */
router.get('/:id', asyncWrapper(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id)
    .populate('centreId')
    .populate('managerId', 'fullName phoneNumber');

  if (!warehouse) {
    throw new NotFoundError('Warehouse not found.');
  }

  return sendSuccess(res, 'Warehouse retrieved', warehouse);
}));

module.exports = router;
