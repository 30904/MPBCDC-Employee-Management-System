const express = require('express');
const authRoutes = require('./authRoutes');
const companyRoutes = require('./companyRoutes');
const uploadRoutes = require('./uploadRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const asyncHandler = require('../utils/asyncHandler');
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
      uploads: `${API_BASE_PATH}/uploads`,
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

// Tenant-scoped placeholder — verifies auth + tenant middleware chain
router.get(
  '/tenant/ping',
  authMiddleware,
  tenantResolver,
  authorizeRoles(...Object.values(ROLES).filter((r) => r !== ROLES.SUPER_ADMIN)),
  asyncHandler(async (req, res) => {
    sendSuccess(res, {
      message: 'Tenant context resolved',
      companyId: req.companyId,
      userId: req.user.id,
    });
  })
);

module.exports = router;
