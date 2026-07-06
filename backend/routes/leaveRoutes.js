const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const assertEmployeeSelfScope = require('../middleware/employeeSelfScope');
const { ROLES } = require('../utils/roles');
const leaveController = require('../controllers/employeeSelfServiceController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.EMPLOYEE));
router.use(assertEmployeeSelfScope);

router.post('/apply', asyncHandler(leaveController.applyLeave));
router.get('/history', asyncHandler(leaveController.leaveHistory));
router.get('/balance', asyncHandler(leaveController.leaveBalance));

module.exports = router;