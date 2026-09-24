const marketplaceService = require('../services/marketplace.service');
const { sendSuccess } = require('../utils/response');

const getMarketplaceLots = async (req, res, next) => {
  try {
    const result = await marketplaceService.getMarketplaceLots(req.query);
    sendSuccess(res, result.items, 'Marketplace lots retrieved successfully.', 200, {
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getMarketplaceLotDetail = async (req, res, next) => {
  try {
    const lot = await marketplaceService.getMarketplaceLotDetail(req.params.id);
    sendSuccess(res, lot, 'Marketplace lot details retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const getMarketplaceFilters = async (req, res, next) => {
  try {
    const filters = await marketplaceService.getMarketplaceFilters();
    sendSuccess(res, filters, 'Marketplace filters retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMarketplaceLots,
  getMarketplaceLotDetail,
  getMarketplaceFilters
};
