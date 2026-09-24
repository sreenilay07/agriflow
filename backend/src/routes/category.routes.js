const express = require('express');
const asyncWrapper = require('../utils/asyncWrapper');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

router.use(protect);

router.get(
  '/',
  asyncWrapper(categoryController.getCategories)
);

router.get(
  '/:id',
  asyncWrapper(categoryController.getCategoryById)
);

router.post(
  '/',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(categoryController.createCategory)
);

router.put(
  '/:id',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(categoryController.updateCategory)
);

router.patch(
  '/:id/status',
  requireRole(ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN),
  asyncWrapper(categoryController.toggleCategoryStatus)
);

module.exports = router;
