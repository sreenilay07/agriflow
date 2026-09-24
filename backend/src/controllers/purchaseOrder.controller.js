const purchaseOrderService = require('../services/purchaseOrder.service');
const { sendSuccess } = require('../utils/response');

const createPurchaseOrder = async (req, res, next) => {
  try {
    const po = await purchaseOrderService.createPurchaseOrder(req.user._id, req.body, req.user);
    sendSuccess(res, po, 'Purchase Order created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const getPurchaseOrders = async (req, res, next) => {
  try {
    const result = await purchaseOrderService.getPurchaseOrders(req.query, req.user);
    sendSuccess(res, result.orders, 'Purchase Orders retrieved successfully.', 200, {
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getPurchaseOrderDetail = async (req, res, next) => {
  try {
    const po = await purchaseOrderService.getPurchaseOrderDetail(req.params.id, req.user);
    sendSuccess(res, po, 'Purchase Order details retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const reviewPurchaseOrder = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body;
    const po = await purchaseOrderService.reviewPurchaseOrder(
      req.params.id,
      action,
      req.user,
      rejectionReason
    );
    sendSuccess(res, po, `Purchase Order ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderDetail,
  reviewPurchaseOrder
};
