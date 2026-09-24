const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplace.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/lots', marketplaceController.getMarketplaceLots);
router.get('/lots/:id', marketplaceController.getMarketplaceLotDetail);
router.get('/filters', marketplaceController.getMarketplaceFilters);

module.exports = router;
