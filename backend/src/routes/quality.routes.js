const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { sendSuccess } = require('../utils/responseHandler');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const qualityService = require('../services/quality.service');

const router = express.Router();

router.use(protect);

/**
 * @route POST /api/v1/quality-inspections
 * @desc Record & submit quality inspection for a lot (Inspector / Officer)
 */
router.post(
  '/',
  requireRole(ROLES.CENTER_OPERATOR, ROLES.PROCUREMENT_OFFICER, ROLES.CENTRE_MANAGER, ROLES.SUPER_ADMIN),
  asyncWrapper(async (req, res) => {
    const { lotId, ...data } = req.body;
    const inspection = await qualityService.submitInspection(lotId, data, req.user);
    return sendSuccess(res, 'Quality inspection submitted and grade evaluated', inspection, 201);
  })
);

/**
 * @route GET /api/v1/quality-inspections
 * @desc List all quality inspections
 */
router.get('/', asyncWrapper(async (req, res) => {
  const inspections = await qualityService.listInspections(req.query);
  return sendSuccess(res, 'Quality inspections retrieved', inspections);
}));

/**
 * @route GET /api/v1/quality-inspections/:id
 * @desc Get inspection details by ID
 */
router.get('/:id', asyncWrapper(async (req, res) => {
  const inspection = await qualityService.getInspectionById(req.params.id);
  return sendSuccess(res, 'Quality inspection retrieved', inspection);
}));

module.exports = router;
