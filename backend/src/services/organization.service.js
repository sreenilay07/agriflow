const Organization = require('../models/Organization');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');

const createOrganization = async (data) => {
  const existing = await Organization.findOne({ code: data.code.toUpperCase() });
  if (existing) {
    throw new BadRequestError(`Organization with code '${data.code}' already exists.`);
  }

  const organization = await Organization.create({
    ...data,
    code: data.code.toUpperCase()
  });

  return organization;
};

const getOrganizations = async (query = {}) => {
  const filter = {};
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;
  if (query.regionId) filter.regionId = query.regionId;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } }
    ];
  }

  const organizations = await Organization.find(filter)
    .populate('regionId', 'name code state')
    .sort({ createdAt: -1 })
    .lean();

  return organizations;
};

const getOrganizationById = async (id) => {
  const organization = await Organization.findById(id)
    .populate('regionId', 'name code state')
    .lean();

  if (!organization) {
    throw new NotFoundError('Organization not found.');
  }

  return organization;
};

const updateOrganization = async (id, updateData) => {
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
    const existing = await Organization.findOne({ code: updateData.code, _id: { $ne: id } });
    if (existing) {
      throw new BadRequestError(`Organization code '${updateData.code}' is already taken.`);
    }
  }

  const organization = await Organization.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!organization) {
    throw new NotFoundError('Organization not found.');
  }

  return organization;
};

const toggleOrganizationStatus = async (id) => {
  const org = await Organization.findById(id);
  if (!org) {
    throw new NotFoundError('Organization not found.');
  }

  org.status = org.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  await org.save();
  return org;
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  toggleOrganizationStatus
};
