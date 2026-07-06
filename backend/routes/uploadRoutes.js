const express = require('express');
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { uploadSinglePdf, handleUploadError } = require('../middleware/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../utils/roles');

const router = express.Router();

/**
 * POST /api/uploads
 * multipart/form-data, field: file, PDF only, max 5MB
 * Used by loan/leave attachment flows — stores under uploads/<companyId>/
 */
router.post(
  '/',
  authMiddleware,
  tenantResolver,
  authorizeRoles(...Object.values(ROLES).filter((role) => role !== ROLES.SUPER_ADMIN)),
  (req, res, next) => {
    uploadSinglePdf(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next);
      return next();
    });
  },
  asyncHandler(uploadController.uploadPdf)
);

module.exports = router;
