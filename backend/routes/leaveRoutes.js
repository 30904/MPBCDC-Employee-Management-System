const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const assertEmployeeSelfScope = require('../middleware/employeeSelfScope');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const leaveController = require('../controllers/employeeSelfServiceController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.EMPLOYEE));
router.use(assertEmployeeSelfScope);

router.get('/types', asyncHandler(leaveController.leaveTypeOptions));
router.get('/preview', asyncHandler(leaveController.previewLeave));
router.post('/apply', asyncHandler(leaveController.applyLeave));
router.get('/history', validatePaginationMiddleware, asyncHandler(leaveController.leaveHistory));
router.get('/balance', validatePaginationMiddleware, asyncHandler(leaveController.leaveBalance));

module.exports = router;