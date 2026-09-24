const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/procurement-insights', aiController.getProcurementInsights);
router.post('/quality-interpretation', aiController.interpretQuality);
router.get('/farmer-insights', aiController.getFarmerInsights);
router.get('/farmer-insights/:farmerId', aiController.getFarmerInsights);
router.get('/shipment-risk/:id', aiController.getShipmentRisk);
router.get('/warehouse-intelligence/:id', aiController.getWarehouseIntelligence);

module.exports = router;
