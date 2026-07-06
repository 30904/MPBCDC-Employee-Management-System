const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const loanRecoveryController = require('../controllers/loanRecoveryController');

const RECOVERY_ROLES = [ROLES.CLIENT_ADMIN, ROLES.FINANCE_OFFICER];

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);

router.get(
  '/pending',
  authorizeRoles(...RECOVERY_ROLES),
  asyncHandler(loanRecoveryController.listPending)
);

router.get(
  '/',
  authorizeRoles(...RECOVERY_ROLES),
  validatePaginationMiddleware,
  asyncHandler(loanRecoveryController.listRecoveries)
);

router.post(
  '/',
  authorizeRoles(...RECOVERY_ROLES),
  asyncHandler(loanRecoveryController.recordRecovery)
);

module.exports = router;
