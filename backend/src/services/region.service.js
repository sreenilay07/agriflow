const Region = require('../models/Region');
const District = require('../models/District');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');

const createRegion = async (data) => {
  const existing = await Region.findOne({ code: data.code.toUpperCase() });
  if (existing) {
    throw new BadRequestError(`Region with code '${data.code}' already exists.`);
  }

  const region = await Region.create({
    ...data,
    code: data.code.toUpperCase()
  });

  return region;
};

const getRegions = async (query = {}) => {
  const filter = {};
  if (query.state) filter.state = query.state;
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } }
    ];
  }

  const regions = await Region.find(filter).sort({ name: 1 }).lean();

  // Populate districts count for each region
  const regionIds = regions.map((r) => r._id);
  const districts = await District.find({ regionId: { $in: regionIds } }).select('_id regionId name code');

  const regionsWithDistricts = regions.map((r) => ({
    ...r,
    districts: districts.filter((d) => d.regionId && d.regionId.toString() === r._id.toString())
  }));

  return regionsWithDistricts;
};

const getRegionById = async (id) => {
  const region = await Region.findById(id).lean();
  if (!region) {
    throw new NotFoundError('Region not found.');
  }

  const districts = await District.find({ regionId: region._id }).lean();
  return {
    ...region,
    districts
  };
};

const updateRegion = async (id, updateData) => {
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
    const existing = await Region.findOne({ code: updateData.code, _id: { $ne: id } });
    if (existing) {
      throw new BadRequestError(`Region code '${updateData.code}' is already taken.`);
    }
  }

  const region = await Region.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!region) {
    throw new NotFoundError('Region not found.');
  }

  return region;
};

const toggleRegionStatus = async (id) => {
  const region = await Region.findById(id);
  if (!region) {
    throw new NotFoundError('Region not found.');
  }

  region.status = region.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  await region.save();
  return region;
};

module.exports = {
  createRegion,
  getRegions,
  getRegionById,
  updateRegion,
  toggleRegionStatus
};
