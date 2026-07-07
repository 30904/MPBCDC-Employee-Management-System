const express = require('express');
const authRoutes = require('./authRoutes');
const companyRoutes = require('./companyRoutes');
const departmentRoutes = require('./departmentRoutes');
const employeeRoutes = require('./employeeRoutes');
const uploadRoutes = require('./uploadRoutes');
const leaveRoutes = require('./leaveRoutes');
const loanRoutes = require('./loanRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', service: 'mpbcdc-hrms-api' });
});

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/departments', departmentRoutes);
router.use('/employees', employeeRoutes);
router.use('/uploads', uploadRoutes);
router.use('/leaves', leaveRoutes);
router.use('/loans', loanRoutes);

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
