const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const assertEmployeeSelfScope = require('../middleware/employeeSelfScope');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const loanDisbursementController = require('../controllers/loanDisbursementController');

const DISBURSEMENT_ROLES = [ROLES.CLIENT_ADMIN, ROLES.FINANCE_OFFICER];

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);

router.get(
  '/pending',
  authorizeRoles(...DISBURSEMENT_ROLES),
  asyncHandler(loanDisbursementController.listPending)
);

router.get(
  '/',
  authorizeRoles(...DISBURSEMENT_ROLES),
  validatePaginationMiddleware,
  asyncHandler(loanDisbursementController.listDisbursements)
);

router.post(
  '/',
  authorizeRoles(...DISBURSEMENT_ROLES),
  asyncHandler(loanDisbursementController.disburse)
);

router.get(
  '/schedule/:applicationId',
  authorizeRoles(ROLES.CLIENT_ADMIN, ROLES.FINANCE_OFFICER, ROLES.EMPLOYEE),
  assertEmployeeSelfScope,
  asyncHandler(loanDisbursementController.getSchedule)
);

module.exports = router;
