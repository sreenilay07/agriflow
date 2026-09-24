const express = require('express');
const router = express.Router();
const anomalyService = require('../services/anomalyService');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const { sendSuccess } = require('../utils/responseHandler');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(protect);

router.get(
  '/',
  requireRole(ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.CENTRE_MANAGER),
  asyncWrapper(async (req, res) => {
    const anomalies = await anomalyService.detectAnomalies();
    return sendSuccess(res, 'Operational anomalies retrieved', {
      count: anomalies.length,
      anomalies
    });
  })
);

module.exports = router;
