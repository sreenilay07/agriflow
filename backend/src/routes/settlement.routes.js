const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess } = require('../utils/responseHandler');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const settlementService = require('../services/settlement.service');

const router = express.Router();

router.use(protect);

/**
 * @route POST /api/v1/settlements/preview
 * @desc Calculate settlement preview server-side with precise arithmetic
 */
router.post('/preview', asyncWrapper(async (req, res) => {
  const calculation = await settlementService.calculateSettlementPreview(req.body);
  return sendSuccess(res, 'Settlement preview calculated successfully', calculation);
}));

/**
 * @route POST /api/v1/settlements
 * @desc Finalize and create farmer settlement record (Officer / Manager / Admin)
 */
router.post(
  '/',
  requireRole(ROLES.CENTER_OPERATOR, ROLES.PROCUREMENT_OFFICER, ROLES.CENTRE_MANAGER, ROLES.SUPER_ADMIN),
  asyncWrapper(async (req, res) => {
    const { lotId, ...data } = req.body;
    const settlement = await settlementService.createSettlement(lotId, data, req.user);
    return sendSuccess(res, 'Settlement finalized successfully', settlement, 201);
  })
);

/**
 * @route GET /api/v1/settlements/me
 * @desc List settlements for current authenticated farmer
 */
router.get('/me', requireRole(ROLES.FARMER), asyncWrapper(async (req, res) => {
  const settlements = await settlementService.getFarmerSettlements(req.user._id, req.query);
  return sendSuccess(res, 'Farmer settlements retrieved', settlements);
}));

/**
 * @route GET /api/v1/settlements/:id
 * @desc Get settlement details by ID
 */
router.get('/:id', asyncWrapper(async (req, res) => {
  const settlement = await settlementService.getSettlementById(req.params.id, req.user);
  return sendSuccess(res, 'Settlement retrieved', settlement);
}));

/**
 * @route PATCH /api/v1/settlements/:id/payment-status
 * @desc Update payment disbursement status (Officer / Manager / Admin)
 */
router.patch(
  '/:id/payment-status',
  requireRole(ROLES.CENTRE_MANAGER, ROLES.SUPER_ADMIN),
  asyncWrapper(async (req, res) => {
    const settlement = await settlementService.updatePaymentStatus(req.params.id, req.body, req.user);
    return sendSuccess(res, 'Payment status updated successfully', settlement);
  })
);

module.exports = router;
