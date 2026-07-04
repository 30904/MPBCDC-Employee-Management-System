const express = require('express');
const autoNumberController = require('../controllers/autoNumberController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/formats', asyncHandler(autoNumberController.getAutoNumberFormats));

router.get(
  '/preview/:prefix',
  authMiddleware,
  tenantResolver,
  asyncHandler(autoNumberController.previewAutoNumber)
);

module.exports = router;
