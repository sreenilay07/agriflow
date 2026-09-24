const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logistics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

// Fleet Vehicles
router.get('/vehicles', logisticsController.getVehicles);
router.post(
  '/vehicles',
  authorize(ROLES.LOGISTICS_COORDINATOR, ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN),
  logisticsController.createVehicle
);

// Shipments
router.get('/shipments', logisticsController.getShipments);
router.get('/shipments/:id', logisticsController.getShipmentDetail);
router.get('/dashboard-metrics', logisticsController.getDashboardMetrics);

router.post(
  '/shipments',
  authorize(
    ROLES.LOGISTICS_COORDINATOR,
    ROLES.SUPER_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.CENTRE_MANAGER
  ),
  logisticsController.createShipment
);

router.post(
  '/shipments/:id/dispatch',
  authorize(
    ROLES.LOGISTICS_COORDINATOR,
    ROLES.SUPER_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.CENTRE_MANAGER
  ),
  logisticsController.dispatchShipment
);

router.patch(
  '/shipments/:id/transit-status',
  authorize(
    ROLES.LOGISTICS_COORDINATOR,
    ROLES.SUPER_ADMIN,
    ROLES.DISTRICT_ADMIN
  ),
  logisticsController.updateTransitStatus
);

// Delivery Confirmation (Buyer or Logistics/Manager)
router.post(
  '/delivery-confirmation',
  authorize(
    ROLES.BUYER,
    ROLES.LOGISTICS_COORDINATOR,
    ROLES.SUPER_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.CENTRE_MANAGER
  ),
  logisticsController.confirmDelivery
);

module.exports = router;
