const logisticsService = require('../services/logistics.service');
const { sendSuccess } = require('../utils/response');

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await logisticsService.createVehicle(req.body);
    sendSuccess(res, vehicle, 'Vehicle registered successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await logisticsService.getVehicles(req.query);
    sendSuccess(res, vehicles, 'Vehicles retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const createShipment = async (req, res, next) => {
  try {
    const shipment = await logisticsService.createShipment(req.body, req.user);
    sendSuccess(res, shipment, 'Shipment created and scheduled successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const getShipments = async (req, res, next) => {
  try {
    const result = await logisticsService.getShipments(req.query, req.user);
    sendSuccess(res, result.shipments, 'Shipments retrieved successfully.', 200, {
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getShipmentDetail = async (req, res, next) => {
  try {
    const shipment = await logisticsService.getShipmentDetail(req.params.id);
    sendSuccess(res, shipment, 'Shipment details retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const dispatchShipment = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const shipment = await logisticsService.dispatchShipment(req.params.id, req.user, notes);
    sendSuccess(res, shipment, 'Shipment dispatched successfully.');
  } catch (err) {
    next(err);
  }
};

const updateTransitStatus = async (req, res, next) => {
  try {
    const { status, location, notes } = req.body;
    const shipment = await logisticsService.updateTransitStatus(
      req.params.id,
      status,
      location,
      notes,
      req.user
    );
    sendSuccess(res, shipment, `Transit status updated to ${status}.`);
  } catch (err) {
    next(err);
  }
};

const confirmDelivery = async (req, res, next) => {
  try {
    const result = await logisticsService.confirmDelivery(req.body, req.user);
    sendSuccess(res, result, 'Delivery confirmation recorded successfully.');
  } catch (err) {
    next(err);
  }
};

const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await logisticsService.getLogisticsDashboardMetrics();
    sendSuccess(res, metrics, 'Logistics metrics retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  createShipment,
  getShipments,
  getShipmentDetail,
  dispatchShipment,
  updateTransitStatus,
  confirmDelivery,
  getDashboardMetrics
};
