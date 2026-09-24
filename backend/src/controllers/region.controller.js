const regionService = require('../services/region.service');
const { sendSuccess } = require('../utils/responseHandler');

const createRegion = async (req, res) => {
  const region = await regionService.createRegion(req.body);
  return sendSuccess(res, 'Region created successfully', region, 201);
};

const getRegions = async (req, res) => {
  const regions = await regionService.getRegions(req.query);
  return sendSuccess(res, 'Regions retrieved successfully', regions);
};

const getRegionById = async (req, res) => {
  const region = await regionService.getRegionById(req.params.id);
  return sendSuccess(res, 'Region details retrieved successfully', region);
};

const updateRegion = async (req, res) => {
  const region = await regionService.updateRegion(req.params.id, req.body);
  return sendSuccess(res, 'Region updated successfully', region);
};

const toggleRegionStatus = async (req, res) => {
  const region = await regionService.toggleRegionStatus(req.params.id);
  return sendSuccess(res, `Region status updated to ${region.status}`, region);
};

module.exports = {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  toggleRegionStatus
};
