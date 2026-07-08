const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const leaveApplicationController = require('../controllers/leaveApplicationController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/queue', asyncHandler(leaveApplicationController.listApprovalQueue));
router.get('/', validatePaginationMiddleware, asyncHandler(leaveApplicationController.listApplications));
router.post('/:id/decision', asyncHandler(leaveApplicationController.recordApprovalDecision));
router.get('/:id', asyncHandler(leaveApplicationController.getApplication));

module.exports = router;
