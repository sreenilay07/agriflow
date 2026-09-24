const analyticsService = require('../services/analytics.service');
const { sendSuccess } = require('../utils/responseHandler');
const asyncWrapper = require('../utils/asyncWrapper');

const getAdminOverview = asyncWrapper(async (req, res) => {
  const { range = '30d' } = req.query;
  const data = await analyticsService.getAdminOverview(range);
  return sendSuccess(res, 'Admin overview analytics retrieved', data);
});

const getProcurementAnalytics = asyncWrapper(async (req, res) => {
  const { range = '30d' } = req.query;
  const data = await analyticsService.getProcurementAnalytics(range);
  return sendSuccess(res, 'Procurement analytics retrieved', data);
});

const getQualityAnalytics = asyncWrapper(async (req, res) => {
  const { range = '30d' } = req.query;
  const data = await analyticsService.getQualityAnalytics(range);
  return sendSuccess(res, 'Quality grading analytics retrieved', data);
});

const getLogisticsAnalytics = asyncWrapper(async (req, res) => {
  const { range = '30d' } = req.query;
  const data = await analyticsService.getLogisticsAnalytics(range);
  return sendSuccess(res, 'Logistics fleet analytics retrieved', data);
});

const getSettlementAnalytics = asyncWrapper(async (req, res) => {
  const { range = '30d' } = req.query;
  const data = await analyticsService.getSettlementAnalytics(range);
  return sendSuccess(res, 'Settlement financials analytics retrieved', data);
});

module.exports = {
  getAdminOverview,
  getProcurementAnalytics,
  getQualityAnalytics,
  getLogisticsAnalytics,
  getSettlementAnalytics
};
