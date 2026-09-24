const organizationService = require('../services/organization.service');
const { sendSuccess } = require('../utils/responseHandler');

const createOrganization = async (req, res) => {
  const org = await organizationService.createOrganization(req.body);
  return sendSuccess(res, 'Organization created successfully', org, 201);
};

const getOrganizations = async (req, res) => {
  const orgs = await organizationService.getOrganizations(req.query);
  return sendSuccess(res, 'Organizations retrieved successfully', orgs);
};

const getOrganizationById = async (req, res) => {
  const org = await organizationService.getOrganizationById(req.params.id);
  return sendSuccess(res, 'Organization details retrieved successfully', org);
};

const updateOrganization = async (req, res) => {
  const org = await organizationService.updateOrganization(req.params.id, req.body);
  return sendSuccess(res, 'Organization updated successfully', org);
};

const toggleOrganizationStatus = async (req, res) => {
  const org = await organizationService.toggleOrganizationStatus(req.params.id);
  return sendSuccess(res, `Organization status updated to ${org.status}`, org);
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  toggleOrganizationStatus
};
