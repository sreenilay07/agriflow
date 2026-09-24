const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrder.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.BUYER, ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN),
  purchaseOrderController.createPurchaseOrder
);

router.get('/', purchaseOrderController.getPurchaseOrders);
router.get('/:id', purchaseOrderController.getPurchaseOrderDetail);

router.patch(
  '/:id/review',
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.DISTRICT_ADMIN,
    ROLES.CENTRE_MANAGER,
    ROLES.CENTER_OPERATOR,
    ROLES.PROCUREMENT_OFFICER
  ),
  purchaseOrderController.reviewPurchaseOrder
);

module.exports = router;
