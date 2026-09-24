const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const organizationController = require('../controllers/organization.controller');

const router = express.Router();

router.use(protect);

router.get(
  '/',
  asyncWrapper(organizationController.getOrganizations)
);

router.get(
  '/:id',
  asyncWrapper(organizationController.getOrganizationById)
);

router.post(
  '/',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(organizationController.createOrganization)
);

router.put(
  '/:id',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(organizationController.updateOrganization)
);

router.patch(
  '/:id/status',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(organizationController.toggleOrganizationStatus)
);

module.exports = router;
