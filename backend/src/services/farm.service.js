const Farm = require('../models/Farm');
const FarmerProfile = require('../models/FarmerProfile');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/customErrors');
const { ROLES } = require('../constants/roles');

/**
 * Create a new Farm for a farmer
 */
const createFarm = async (farmerId, data) => {
  const { farmName, village, mandal, district, state, pincode, surveyNumber, acreage, ownershipType, soilType, irrigationSource, cropsGrown } = data;

  if (!farmName) {
    throw new BadRequestError('Farm name is required.');
  }

  const acres = Number(acreage);
  if (isNaN(acres) || acres <= 0) {
    throw new BadRequestError('Acreage must be a positive number greater than 0.');
  }

  const farmerProfile = await FarmerProfile.findOne({ userId: farmerId });

  const farm = new Farm({
    farmerId,
    farmerProfileId: farmerProfile ? farmerProfile._id : null,
    farmName: farmName.trim(),
    village: village || (farmerProfile ? farmerProfile.village : ''),
    mandal: mandal || (farmerProfile ? farmerProfile.mandal : ''),
    district: district || (farmerProfile ? farmerProfile.district : ''),
    state: state || (farmerProfile ? farmerProfile.state : 'Telangana'),
    pincode: pincode || (farmerProfile ? farmerProfile.pincode : ''),
    surveyNumber: surveyNumber || '',
    acreage: acres,
    ownershipType: ownershipType || 'OWNED',
    soilType: soilType || 'Black Soil',
    irrigationSource: irrigationSource || 'BOREWELL',
    cropsGrown: cropsGrown || []
  });

  await farm.save();
  return farm;
};

/**
 * List farms for a farmer
 */
const getFarmerFarms = async (farmerId) => {
  const farms = await Farm.find({ farmerId, status: 'ACTIVE' })
    .populate('cropsGrown', 'name code unit category')
    .sort({ createdAt: -1 });
  return farms;
};

/**
 * Get farm by ID
 */
const getFarmById = async (farmId, user) => {
  const farm = await Farm.findById(farmId).populate('cropsGrown');
  if (!farm) {
    throw new NotFoundError('Farm not found.');
  }

  if (user.role === ROLES.FARMER && farm.farmerId.toString() !== user._id.toString()) {
    throw new ForbiddenError('You are not authorized to access this farm.');
  }

  return farm;
};

/**
 * Update farm
 */
const updateFarm = async (farmId, data, user) => {
  const farm = await Farm.findById(farmId);
  if (!farm) {
    throw new NotFoundError('Farm not found.');
  }

  if (user.role === ROLES.FARMER && farm.farmerId.toString() !== user._id.toString()) {
    throw new ForbiddenError('You are not authorized to modify this farm.');
  }

  const allowedFields = ['farmName', 'village', 'mandal', 'district', 'pincode', 'surveyNumber', 'acreage', 'ownershipType', 'soilType', 'irrigationSource', 'cropsGrown', 'status'];
  allowedFields.forEach(f => {
    if (data[f] !== undefined) farm[f] = data[f];
  });

  await farm.save();
  return farm;
};

module.exports = {
  createFarm,
  getFarmerFarms,
  getFarmById,
  updateFarm
};
