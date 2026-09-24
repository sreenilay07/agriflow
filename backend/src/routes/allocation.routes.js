const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocation.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.post(
  '/',
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.CENTRE_MANAGER,
    ROLES.CENTER_OPERATOR,
    ROLES.PROCUREMENT_OFFICER
  ),
  allocationController.allocateLot
);

router.get('/', allocationController.getAllocations);

router.post(
  '/:id/cancel',
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.CENTRE_MANAGER
  ),
  allocationController.cancelAllocation
);

module.exports = router;
