const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const approvalMatrixController = require('../controllers/approvalMatrixController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/', validatePaginationMiddleware, asyncHandler(approvalMatrixController.listApprovalMatrices));
router.post('/initialize-loan-default', asyncHandler(approvalMatrixController.initializeLoanApprovalMatrix));
router.post(
  '/initialize-leave-default',
  asyncHandler(approvalMatrixController.initializeLeaveApprovalMatrix)
);
router.post('/', asyncHandler(approvalMatrixController.createApprovalMatrix));
router.get('/:id', asyncHandler(approvalMatrixController.getApprovalMatrix));
router.put('/:id', asyncHandler(approvalMatrixController.updateApprovalMatrix));
router.delete('/:id', asyncHandler(approvalMatrixController.deleteApprovalMatrix));

module.exports = router;
