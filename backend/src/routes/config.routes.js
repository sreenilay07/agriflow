const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const configService = require('../services/config.service');
const { sendSuccess } = require('../utils/responseHandler');

const router = express.Router();

router.use(protect);

router.get(
  '/',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.DISTRICT_OFFICER),
  asyncWrapper(async (req, res) => {
    const configs = await configService.getAllConfigs();
    return sendSuccess(res, 'Platform configurations retrieved', configs);
  })
);

router.put(
  '/:key',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    const updated = await configService.updateConfig(key, value, req.user._id);
    return sendSuccess(res, `Configuration '${key}' updated successfully`, updated);
  })
);

module.exports = router;
