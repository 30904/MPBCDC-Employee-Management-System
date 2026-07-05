const express = require('express');
const authRoutes = require('./authRoutes');
const companyRoutes = require('./companyRoutes');
const uploadRoutes = require('./uploadRoutes');
const autoNumberRoutes = require('./autoNumberRoutes');
const dateRoutes = require('./dateRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');
const { ROLES } = require('../utils/roles');
const { API_BASE_PATH, API_INFO } = require('../config/api');

const RESPONSE_CONVENTION = {
  success: { success: true, data: '<payload>' },
  paginated: {
    success: true,
    data: '<array>',
    meta: {
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
  },
  error: { success: false, error: '<message>' },
  paginationQuery: '?page=1&limit=20',
  autoNumbers: {
    format: '{PREFIX}-{YEAR}-{#####}',
    examples: ['LN-2026-00001', 'LV-2026-00001', 'SR-2026-00001'],
    scope: 'Per companyId sequence',
  },
  fileUpload: {
    contentType: 'multipart/form-data',
    fieldName: 'file',
    maxSizeMb: 5,
    allowedTypes: ['application/pdf'],
    endpoint: `${API_BASE_PATH}/uploads`,
  },
  dates: {
    api: 'ISO 8601',
    apiExamples: ['2026-07-04', '2026-07-04T10:30:00.000Z'],
    ui: 'DD-MMM-YYYY',
    uiExample: '04-Jul-2026',
  },
};

const router = express.Router();

/**
 * GET /api — API root (convention: all routes under /api)
 */
router.get('/', (_req, res) => {
  sendSuccess(res, {
    ...API_INFO,
    responseConvention: RESPONSE_CONVENTION,
    endpoints: {
      health: `${API_BASE_PATH}/health`,
      auth: {
        login: `${API_BASE_PATH}/auth/login`,
        me: `${API_BASE_PATH}/auth/me`,
      },
      companies: `${API_BASE_PATH}/companies?page=1&limit=20`,
      uploads: {
        formats: `${API_BASE_PATH}/uploads/formats`,
        create: `${API_BASE_PATH}/uploads`,
      },
      autoNumbers: {
        formats: `${API_BASE_PATH}/auto-numbers/formats`,
        preview: `${API_BASE_PATH}/auto-numbers/preview/:prefix`,
      },
      dates: {
        formats: `${API_BASE_PATH}/dates/formats`,
      },
      tenantPing: `${API_BASE_PATH}/tenant/ping`,
    },
  });
});

router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', service: API_INFO.name, basePath: API_BASE_PATH });
});

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/uploads', uploadRoutes);
router.use('/auto-numbers', autoNumberRoutes);
router.use('/dates', dateRoutes);

// Tenant-scoped — SUPER_ADMIN may pass x-company-id header via tenantResolver
router.get(
  '/tenant/ping',
  authMiddleware,
  tenantResolver,
  authorizeRoles(...Object.values(ROLES)),
  asyncHandler(async (req, res) => {
    const tenantUserCount = await User.forTenant(req.companyId).countDocuments();

    sendSuccess(res, {
      message: 'Tenant context resolved',
      companyId: req.companyId,
      userId: req.user.id,
      tenantUserCount,
      actingAsTenant: Boolean(req.tenantCompany),
      tenantName: req.tenantCompany?.name ?? null,
    });
  })
);

module.exports = router;
