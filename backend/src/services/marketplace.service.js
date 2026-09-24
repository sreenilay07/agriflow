const Inventory = require('../models/Inventory');
const ProduceLot = require('../models/ProduceLot');
const QualityInspection = require('../models/QualityInspection');
const Crop = require('../models/Crop');
const Warehouse = require('../models/Warehouse');
const { QUALITY_GRADE } = require('../constants/status');
const { NotFoundError } = require('../utils/customErrors');

/**
 * List verified available agricultural inventory in B2B marketplace
 */
const getMarketplaceLots = async (query = {}) => {
  const {
    cropId,
    grade,
    district,
    minPrice,
    maxPrice,
    minQty,
    maxQty,
    search,
    sortBy = 'newest',
    page = 1,
    limit = 20
  } = query;

  // Canonical inventory matching: status is IN_STOCK and availableQuantity > 0
  const invMatch = {
    status: { $in: ['IN_STOCK', 'AVAILABLE'] },
    $or: [
      { availableQuantity: { $gt: 0 } },
      { availableQuantityKg: { $gt: 0 } }
    ]
  };

  if (minQty || maxQty) {
    const qtyFilter = {};
    if (minQty) qtyFilter.$gte = Number(minQty);
    if (maxQty) qtyFilter.$lte = Number(maxQty);
    invMatch.availableQuantity = qtyFilter;
  }

  if (cropId) {
    invMatch.cropId = cropId;
  }

  if (grade) {
    invMatch.grade = grade;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Build sort options
  let sortOption = { createdAt: -1 };
  if (sortBy === 'qty_desc') sortOption = { availableQuantity: -1 };

  const [inventoryItems, totalCount] = await Promise.all([
    Inventory.find(invMatch)
      .populate('cropId', 'name category defaultUnit basePricePerKg qualityParameters')
      .populate('warehouseId', 'name location district state totalCapacityKg')
      .populate({
        path: 'lotId',
        select: 'lotNumber harvestDate status qualityInspectionId declaredQuantity receivedQuantity',
        populate: {
          path: 'qualityInspectionId',
          select: 'assignedGrade qualityScore metrics inspectionDate moisturePercentage foreignMatterPercentage'
        }
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Inventory.countDocuments(invMatch)
  ]);

  // Sanitize and format for B2B buyer marketplace
  let formattedItems = inventoryItems.map((item) => {
    const crop = item.cropId || item.crop || {};
    const wh = item.warehouseId || item.warehouse || {};
    const lot = item.lotId || item.produceLot || {};
    const qi = lot.qualityInspectionId || lot.qualityInspection || {};

    const basePrice = crop.basePricePerKg || 25;
    const finalGrade = item.grade || item.qualityGrade || qi.assignedGrade || 'GRADE_A';

    // Grade adjustment: Grade A (+10%), Grade B (base), Grade C (-10%)
    let gradePriceMultiplier = 1.0;
    if (finalGrade === 'GRADE_A') gradePriceMultiplier = 1.1;
    else if (finalGrade === 'GRADE_C') gradePriceMultiplier = 0.9;
    const estimatedPricePerKg = Number((basePrice * gradePriceMultiplier).toFixed(2));

    const availQty = typeof item.availableQuantity === 'number' ? item.availableQuantity : (item.availableQuantityKg || 0);
    const totalQty = typeof item.totalQuantity === 'number' ? item.totalQuantity : (item.totalQuantityKg || item.quantityKg || availQty);
    const resQty = typeof item.reservedQuantity === 'number' ? item.reservedQuantity : (item.reservedQuantityKg || 0);

    return {
      inventoryId: item._id,
      batchNumber: item.batchNumber,
      lotId: lot._id,
      lotNumber: lot.lotNumber,
      cropId: crop._id,
      cropName: crop.name || 'Agricultural Produce',
      category: crop.category || 'GRAIN',
      unit: item.unit || crop.defaultUnit || 'kg',
      grade: finalGrade,
      qualityGrade: finalGrade, // backwards-compatible alias
      qualityScore: qi.qualityScore || 85,
      qualityMetrics: {
        moisturePercentage: qi.moisturePercentage,
        foreignMatterPercentage: qi.foreignMatterPercentage,
        ...(qi.metrics || {})
      },
      warehouseId: wh._id,
      warehouseName: wh.name || 'Regional Central Mandi Warehouse',
      region: `${wh.district || 'Hyderabad'}, ${wh.state || 'Telangana'}`,
      district: wh.district || '',
      state: wh.state || '',
      storageLocation: item.storageLocation || item.storageBay || 'Bay-A1',
      storageBay: item.storageLocation || item.storageBay || 'Bay-A1', // alias
      totalQuantity: totalQty,
      availableQuantity: availQty,
      reservedQuantity: resQty,
      totalQuantityKg: totalQty, // alias
      availableQuantityKg: availQty, // alias
      reservedQuantityKg: resQty, // alias
      unitPricePerKg: estimatedPricePerKg,
      harvestDate: lot.harvestDate || item.createdAt,
      verifiedLot: true
    };
  });

  // Client-side text search or district filter if populated fields were filtered
  if (district) {
    formattedItems = formattedItems.filter(
      (item) => item.district.toLowerCase() === district.toLowerCase()
    );
  }

  if (search) {
    const s = search.toLowerCase();
    formattedItems = formattedItems.filter(
      (item) =>
        item.cropName.toLowerCase().includes(s) ||
        item.lotNumber?.toLowerCase().includes(s) ||
        item.region.toLowerCase().includes(s) ||
        item.grade.toLowerCase().includes(s)
    );
  }

  return {
    items: formattedItems,
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum)
    }
  };
};

/**
 * Get detailed marketplace lot specification by inventory ID or lot ID
 */
const getMarketplaceLotDetail = async (id) => {
  let inventory = await Inventory.findById(id)
    .populate('cropId')
    .populate('warehouseId')
    .populate({
      path: 'lotId',
      populate: {
        path: 'qualityInspectionId'
      }
    })
    .lean();

  if (!inventory) {
    // Try finding by ProduceLot ID
    inventory = await Inventory.findOne({ lotId: id })
      .populate('cropId')
      .populate('warehouseId')
      .populate({
        path: 'lotId',
        populate: {
          path: 'qualityInspectionId'
        }
      })
      .lean();
  }

  if (!inventory) {
    throw new NotFoundError('Produce lot not available in marketplace.');
  }

  const crop = inventory.cropId || inventory.crop || {};
  const wh = inventory.warehouseId || inventory.warehouse || {};
  const lot = inventory.lotId || inventory.produceLot || {};
  const qi = lot.qualityInspectionId || lot.qualityInspection || {};

  const basePrice = crop.basePricePerKg || 25;
  const finalGrade = inventory.grade || inventory.qualityGrade || qi.assignedGrade || 'GRADE_A';
  let gradePriceMultiplier = 1.0;
  if (finalGrade === 'GRADE_A') gradePriceMultiplier = 1.1;
  else if (finalGrade === 'GRADE_C') gradePriceMultiplier = 0.9;
  const unitPricePerKg = Number((basePrice * gradePriceMultiplier).toFixed(2));

  const availQty = typeof inventory.availableQuantity === 'number' ? inventory.availableQuantity : (inventory.availableQuantityKg || 0);
  const totalQty = typeof inventory.totalQuantity === 'number' ? inventory.totalQuantity : (inventory.totalQuantityKg || inventory.quantityKg || availQty);
  const resQty = typeof inventory.reservedQuantity === 'number' ? inventory.reservedQuantity : (inventory.reservedQuantityKg || 0);

  return {
    inventoryId: inventory._id,
    batchNumber: inventory.batchNumber,
    lotId: lot._id,
    lotNumber: lot.lotNumber,
    crop: {
      _id: crop._id,
      name: crop.name,
      category: crop.category,
      unit: inventory.unit || crop.defaultUnit || 'kg',
      basePricePerKg: crop.basePricePerKg,
      qualityParameters: crop.qualityParameters
    },
    qualityInspection: {
      assignedGrade: finalGrade,
      qualityScore: qi.qualityScore || 88,
      metrics: {
        moisturePercentage: qi.moisturePercentage,
        foreignMatterPercentage: qi.foreignMatterPercentage,
        brokenGrainPercentage: qi.brokenGrainPercentage,
        damagePercentage: qi.damagePercentage,
        ...(qi.metrics || {})
      },
      inspectionDate: qi.inspectionDate || qi.createdAt
    },
    warehouse: {
      _id: wh._id,
      name: wh.name,
      location: wh.location || wh.address,
      district: wh.district,
      state: wh.state
    },
    storageLocation: inventory.storageLocation || 'Bay-A1',
    storageBay: inventory.storageLocation || 'Bay-A1',
    grade: finalGrade,
    qualityGrade: finalGrade,
    availableQuantity: availQty,
    reservedQuantity: resQty,
    totalQuantity: totalQty,
    availableQuantityKg: availQty,
    reservedQuantityKg: resQty,
    totalQuantityKg: totalQty,
    unitPricePerKg,
    harvestDate: lot.harvestDate,
    status: inventory.status
  };
};

/**
 * Get distinct marketplace filter metadata
 */
const getMarketplaceFilters = async () => {
  const [crops, districts] = await Promise.all([
    Crop.find({ isActive: true }).select('name category').lean(),
    Warehouse.distinct('district')
  ]);

  return {
    crops,
    grades: ['GRADE_A', 'GRADE_B', 'GRADE_C'],
    districts: districts.filter(Boolean)
  };
};

module.exports = {
  getMarketplaceLots,
  getMarketplaceLotDetail,
  getMarketplaceFilters
};
