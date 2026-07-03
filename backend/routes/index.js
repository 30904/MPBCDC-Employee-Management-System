const express = require('express');
const authRoutes = require('./authRoutes');
const companyRoutes = require('./companyRoutes');
const uploadRoutes = require('./uploadRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', service: 'mpbcdc-hrms-api' });
});

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/uploads', uploadRoutes);

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
