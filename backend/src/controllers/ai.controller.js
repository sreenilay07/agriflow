const aiService = require('../services/ai/aiService');
const { sendSuccess } = require('../utils/responseHandler');
const { NotFoundError } = require('../utils/customErrors');
const asyncWrapper = require('../utils/asyncWrapper');

const getProcurementInsights = asyncWrapper(async (req, res) => {
  const data = await aiService.getProcurementInsights();
  return sendSuccess(res, 'AI procurement insights generated', data);
});

const interpretQuality = asyncWrapper(async (req, res) => {
  const data = await aiService.interpretQuality(req.body);
  return sendSuccess(res, 'Quality inspection interpretation completed', data);
});

const getFarmerInsights = asyncWrapper(async (req, res) => {
  const targetFarmerId = req.params.farmerId || req.user._id;
  const data = await aiService.getFarmerInsights(targetFarmerId);
  return sendSuccess(res, 'Farmer intelligence insights generated', data);
});

const getShipmentRisk = asyncWrapper(async (req, res) => {
  const data = await aiService.analyzeShipmentRisk(req.params.id);
  if (!data) {
    throw new NotFoundError('Shipment not found');
  }
  return sendSuccess(res, 'Shipment risk evaluation completed', data);
});

const getWarehouseIntelligence = asyncWrapper(async (req, res) => {
  const data = await aiService.getWarehouseIntelligence(req.params.id);
  if (!data) {
    throw new NotFoundError('Warehouse not found');
  }
  return sendSuccess(res, 'Warehouse intelligence generated', data);
});

module.exports = {
  getProcurementInsights,
  interpretQuality,
  getFarmerInsights,
  getShipmentRisk,
  getWarehouseIntelligence
};
