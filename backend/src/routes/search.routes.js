const express = require('express');
const router = express.Router();
const searchService = require('../services/search.service');
const { protect } = require('../middleware/auth.middleware');
const { sendSuccess } = require('../utils/responseHandler');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(protect);

router.get(
  '/',
  asyncWrapper(async (req, res) => {
    const { q = '' } = req.query;
    const results = await searchService.searchEntities(q, req.user);
    return sendSuccess(res, 'Search results retrieved', {
      query: q,
      count: results.length,
      results
    });
  })
);

module.exports = router;
