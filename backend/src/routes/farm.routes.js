const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess } = require('../utils/responseHandler');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const farmService = require('../services/farm.service');

const router = express.Router();

router.use(protect);

/**
 * @route POST /api/v1/farms
 * @desc Create a farm (Farmer)
 */
router.post('/', requireRole(ROLES.FARMER), asyncWrapper(async (req, res) => {
  const farm = await farmService.createFarm(req.user._id, req.body);
  return sendSuccess(res, 'Farm registered successfully', farm, 201);
}));

/**
 * @route GET /api/v1/farms/me
 * @desc List farms for authenticated farmer
 */
router.get('/me', requireRole(ROLES.FARMER), asyncWrapper(async (req, res) => {
  const farms = await farmService.getFarmerFarms(req.user._id);
  return sendSuccess(res, 'Farms retrieved successfully', farms);
}));

/**
 * @route GET /api/v1/farms/:id
 * @desc Get farm details
 */
router.get('/:id', asyncWrapper(async (req, res) => {
  const farm = await farmService.getFarmById(req.params.id, req.user);
  return sendSuccess(res, 'Farm retrieved', farm);
}));

/**
 * @route PATCH /api/v1/farms/:id
 * @desc Update farm details
 */
router.patch('/:id', asyncWrapper(async (req, res) => {
  const farm = await farmService.updateFarm(req.params.id, req.body, req.user);
  return sendSuccess(res, 'Farm updated successfully', farm);
}));

module.exports = router;
