const ProduceCategory = require('../models/ProduceCategory');
const Crop = require('../models/Crop');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');

const createCategory = async (data) => {
  const existing = await ProduceCategory.findOne({ code: data.code.toUpperCase() });
  if (existing) {
    throw new BadRequestError(`Category with code '${data.code}' already exists.`);
  }

  const category = await ProduceCategory.create({
    ...data,
    code: data.code.toUpperCase()
  });

  return category;
};

const getCategories = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { code: { $regex: query.search, $options: 'i' } }
    ];
  }

  const categories = await ProduceCategory.find(filter).sort({ name: 1 }).lean();

  // Attach crops count
  const categoryIds = categories.map((c) => c._id);
  const crops = await Crop.find({ categoryId: { $in: categoryIds } }).select('_id categoryId name code');

  return categories.map((c) => ({
    ...c,
    crops: crops.filter((cr) => cr.categoryId && cr.categoryId.toString() === c._id.toString())
  }));
};

const getCategoryById = async (id) => {
  const category = await ProduceCategory.findById(id).lean();
  if (!category) {
    throw new NotFoundError('Produce category not found.');
  }

  const crops = await Crop.find({ categoryId: category._id }).lean();
  return {
    ...category,
    crops
  };
};

const updateCategory = async (id, updateData) => {
  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
    const existing = await ProduceCategory.findOne({ code: updateData.code, _id: { $ne: id } });
    if (existing) {
      throw new BadRequestError(`Category code '${updateData.code}' is already taken.`);
    }
  }

  const category = await ProduceCategory.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!category) {
    throw new NotFoundError('Produce category not found.');
  }

  return category;
};

const toggleCategoryStatus = async (id) => {
  const category = await ProduceCategory.findById(id);
  if (!category) {
    throw new NotFoundError('Produce category not found.');
  }

  category.status = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  await category.save();
  return category;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus
};
