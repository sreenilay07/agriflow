const buyerService = require('../services/buyer.service');
const { sendSuccess } = require('../utils/response');

const upsertProfile = async (req, res, next) => {
  try {
    const profile = await buyerService.upsertBuyerProfile(req.user._id, req.body);
    sendSuccess(res, profile, 'Buyer profile updated successfully.');
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await buyerService.getBuyerProfile(req.user._id);
    sendSuccess(res, profile, 'Buyer profile retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const verifyBuyer = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const profile = await buyerService.updateBuyerVerification(
      req.params.id,
      status,
      req.user,
      rejectionReason
    );
    sendSuccess(res, profile, `Buyer verification updated to ${status}.`);
  } catch (err) {
    next(err);
  }
};

const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await buyerService.getBuyerDashboardMetrics(req.user._id);
    sendSuccess(res, metrics, 'Buyer metrics retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upsertProfile,
  getProfile,
  verifyBuyer,
  getDashboardMetrics
};
