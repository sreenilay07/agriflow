const categoryService = require('../services/category.service');
const { sendSuccess } = require('../utils/responseHandler');

const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return sendSuccess(res, 'Produce category created successfully', category, 201);
};

const getCategories = async (req, res) => {
  const categories = await categoryService.getCategories(req.query);
  return sendSuccess(res, 'Produce categories retrieved successfully', categories);
};

const getCategoryById = async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  return sendSuccess(res, 'Produce category details retrieved successfully', category);
};

const updateCategory = async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return sendSuccess(res, 'Produce category updated successfully', category);
};

const toggleCategoryStatus = async (req, res) => {
  const category = await categoryService.toggleCategoryStatus(req.params.id);
  return sendSuccess(res, `Produce category status updated to ${category.status}`, category);
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus
};
