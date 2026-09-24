const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const regionController = require('../controllers/region.controller');

const router = express.Router();

router.use(protect);

router.get(
  '/',
  asyncWrapper(regionController.getRegions)
);

router.get(
  '/:id',
  asyncWrapper(regionController.getRegionById)
);

router.post(
  '/',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(regionController.createRegion)
);

router.put(
  '/:id',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(regionController.updateRegion)
);

router.patch(
  '/:id/status',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(regionController.toggleRegionStatus)
);

module.exports = router;
