const express = require('express');
const router = express.Router();
const exportService = require('../services/export.service');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const asyncWrapper = require('../utils/asyncWrapper');
const { BadRequestError } = require('../utils/customErrors');

router.use(protect);

router.get(
  '/:resource',
  requireRole(ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN, ROLES.CENTRE_MANAGER),
  asyncWrapper(async (req, res) => {
    const { resource } = req.params;
    let csvData = '';
    const filename = `agritrade_${resource}_${new Date().toISOString().split('T')[0]}.csv`;

    switch (resource.toLowerCase()) {
      case 'lots':
        csvData = await exportService.exportLotsCSV();
        break;
      case 'orders':
      case 'purchase-orders':
        csvData = await exportService.exportOrdersCSV();
        break;
      case 'inventory':
        csvData = await exportService.exportInventoryCSV();
        break;
      case 'shipments':
        csvData = await exportService.exportShipmentsCSV();
        break;
      case 'settlements':
        csvData = await exportService.exportSettlementsCSV();
        break;
      default:
        throw new BadRequestError(`Unsupported export resource: ${resource}`);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);
  })
);

module.exports = router;
