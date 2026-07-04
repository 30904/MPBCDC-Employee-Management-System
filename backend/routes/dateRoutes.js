const express = require('express');
const dateController = require('../controllers/dateController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * GET /api/dates/formats
 * Public — documents ISO 8601 (API) and DD-MMM-YYYY (UI) convention.
 */
router.get('/formats', asyncHandler(dateController.getDateFormats));

module.exports = router;
