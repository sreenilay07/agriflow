const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

router.use(protect);

router.get(
  '/admin/overview',
  requireRole(ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.CENTRE_MANAGER),
  analyticsController.getAdminOverview
);

router.get(
  '/procurement',
  requireRole(ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.CENTRE_MANAGER),
  analyticsController.getProcurementAnalytics
);

router.get(
  '/quality',
  requireRole(ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.CENTRE_MANAGER, ROLES.QUALITY_INSPECTOR),
  analyticsController.getQualityAnalytics
);

router.get(
  '/logistics',
  requireRole(ROLES.SUPER_ADMIN, ROLES.LOGISTICS_COORDINATOR, ROLES.CENTRE_MANAGER),
  analyticsController.getLogisticsAnalytics
);

router.get(
  '/settlements',
  requireRole(ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.CENTRE_MANAGER),
  analyticsController.getSettlementAnalytics
);

module.exports = router;
