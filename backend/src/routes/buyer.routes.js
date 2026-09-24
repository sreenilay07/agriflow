const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyer.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.get('/profile', buyerController.getProfile);
router.post('/profile', buyerController.upsertProfile);
router.get('/dashboard-metrics', buyerController.getDashboardMetrics);

// Admin verification
router.patch(
  '/:id/verify',
  authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.CENTRE_MANAGER),
  buyerController.verifyBuyer
);

module.exports = router;
