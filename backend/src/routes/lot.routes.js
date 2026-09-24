const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess } = require('../utils/responseHandler');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const lotService = require('../services/lot.service');

const router = express.Router();

router.use(protect);

/**
 * @route GET /api/v1/produce-lots
 * @desc Query produce lots (Staff / Inspectors / Managers)
 */
router.get('/', asyncWrapper(async (req, res) => {
  const lots = await lotService.getLots(req.query, req.user);
  return sendSuccess(res, 'Produce lots retrieved', lots);
}));

/**
 * @route POST /api/v1/produce-lots
 * @desc Create a new Produce Lot (Farmer)
 */
router.post('/', requireRole(ROLES.FARMER), asyncWrapper(async (req, res) => {
  const lot = await lotService.createLot(req.user._id, req.body);
  return sendSuccess(res, 'Produce lot created successfully', lot, 201);
}));

/**
 * @route GET /api/v1/produce-lots/me
 * @desc List produce lots for current farmer
 */
router.get('/me', requireRole(ROLES.FARMER), asyncWrapper(async (req, res) => {
  const lots = await lotService.getFarmerLots(req.user._id, req.query);
  return sendSuccess(res, 'Farmer produce lots retrieved', lots);
}));

/**
 * @route GET /api/v1/produce-lots/number/:lotNumber
 * @desc Lookup produce lot by business lot number
 */
router.get('/number/:lotNumber', asyncWrapper(async (req, res) => {
  const lot = await lotService.getLotByNumber(req.params.lotNumber, req.user);
  return sendSuccess(res, 'Produce lot retrieved', lot);
}));

/**
 * @route GET /api/v1/produce-lots/:id
 * @desc Get produce lot details by ID
 */
router.get('/:id', asyncWrapper(async (req, res) => {
  const lot = await lotService.getLotById(req.params.id, req.user);
  return sendSuccess(res, 'Produce lot retrieved', lot);
}));

/**
 * @route POST /api/v1/produce-lots/:id/receive
 * @desc Record physical weighment and intake receipt at collection centre
 */
router.post(
  '/:id/receive',
  requireRole(ROLES.CENTER_OPERATOR, ROLES.PROCUREMENT_OFFICER, ROLES.CENTRE_MANAGER, ROLES.SUPER_ADMIN),
  asyncWrapper(async (req, res) => {
    const lot = await lotService.receiveLot(req.params.id, req.body, req.user);
    return sendSuccess(res, 'Produce lot received successfully and moved to inspection queue', lot);
  })
);

/**
 * @route PATCH /api/v1/produce-lots/:id/cancel
 * @desc Cancel a produce lot (Farmer or Admin)
 */
router.patch('/:id/cancel', asyncWrapper(async (req, res) => {
  const lot = await lotService.cancelLot(req.params.id, req.user, req.body.reason);
  return sendSuccess(res, 'Produce lot cancelled successfully', lot);
}));

module.exports = router;
