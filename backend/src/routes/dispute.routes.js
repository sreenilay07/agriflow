const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess } = require('../utils/responseHandler');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const disputeService = require('../services/dispute.service');

const router = express.Router();

router.use(protect);

/**
 * @route POST /api/v1/disputes
 * @desc Lodge a grievance or dispute (Farmer / Buyer / User)
 */
router.post('/', asyncWrapper(async (req, res) => {
  const dispute = await disputeService.createDispute(req.user._id, req.body);
  return sendSuccess(res, 'Dispute lodged successfully and queued for review', dispute, 201);
}));

/**
 * @route GET /api/v1/disputes
 * @desc List disputes for current user or all (Admin / Manager)
 */
router.get('/', asyncWrapper(async (req, res) => {
  const disputes = await disputeService.getDisputes(req.user, req.query);
  return sendSuccess(res, 'Disputes retrieved', disputes);
}));

/**
 * @route GET /api/v1/disputes/:id
 * @desc Get dispute details by ID
 */
router.get('/:id', asyncWrapper(async (req, res) => {
  const dispute = await disputeService.getDisputeById(req.params.id, req.user);
  return sendSuccess(res, 'Dispute retrieved', dispute);
}));

/**
 * @route PATCH /api/v1/disputes/:id/resolve
 * @desc Resolve dispute (Admin / Manager)
 */
router.patch(
  '/:id/resolve',
  requireRole(ROLES.CENTRE_MANAGER, ROLES.DISTRICT_ADMIN, ROLES.SUPER_ADMIN),
  asyncWrapper(async (req, res) => {
    const dispute = await disputeService.resolveDispute(req.params.id, req.body, req.user);
    return sendSuccess(res, 'Dispute updated successfully', dispute);
  })
);

module.exports = router;
