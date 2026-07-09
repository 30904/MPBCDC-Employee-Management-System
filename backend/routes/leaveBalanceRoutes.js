const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const assertEmployeeSelfScope = require('../middleware/employeeSelfScope');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const leaveBalanceController = require('../controllers/leaveBalanceController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);

router.get(
  '/my',
  authorizeRoles(ROLES.EMPLOYEE),
  assertEmployeeSelfScope,
  validatePaginationMiddleware,
  asyncHandler(leaveBalanceController.myLeaveBalances)
);

router.get(
  '/',
  authorizeRoles(ROLES.CLIENT_ADMIN),
  validatePaginationMiddleware,
  asyncHandler(leaveBalanceController.listLeaveBalances)
);

router.post(
  '/year-end-close',
  authorizeRoles(ROLES.CLIENT_ADMIN),
  asyncHandler(leaveBalanceController.runYearEndClose)
);

module.exports = router;
