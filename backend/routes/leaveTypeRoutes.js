const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const leaveTypeController = require('../controllers/leaveTypeController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/', validatePaginationMiddleware, asyncHandler(leaveTypeController.listLeaveTypes));
router.post('/', asyncHandler(leaveTypeController.createLeaveType));
router.get('/:id', asyncHandler(leaveTypeController.getLeaveType));
router.put('/:id', asyncHandler(leaveTypeController.updateLeaveType));
router.delete('/:id', asyncHandler(leaveTypeController.deleteLeaveType));

module.exports = router;
