const allocationService = require('../services/allocation.service');
const { sendSuccess } = require('../utils/response');

const allocateLot = async (req, res, next) => {
  try {
    const result = await allocationService.allocateLotToPO(req.body, req.user);
    sendSuccess(res, result, 'Lot allocated to Purchase Order successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const cancelAllocation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const allocation = await allocationService.cancelAllocation(req.params.id, reason, req.user);
    sendSuccess(res, allocation, 'Allocation cancelled and inventory reserved stock released.');
  } catch (err) {
    next(err);
  }
};

const getAllocations = async (req, res, next) => {
  try {
    const allocations = await allocationService.getAllocations(req.query);
    sendSuccess(res, allocations, 'Allocations retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  allocateLot,
  cancelAllocation,
  getAllocations
};
