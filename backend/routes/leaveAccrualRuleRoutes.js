const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const leaveAccrualRuleController = require('../controllers/leaveAccrualRuleController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN, ROLES.HR_OFFICER));

router.get('/leave-type-options', asyncHandler(leaveAccrualRuleController.listLeaveTypeOptions));
router.get('/', validatePaginationMiddleware, asyncHandler(leaveAccrualRuleController.listAccrualRules));
router.post('/', asyncHandler(leaveAccrualRuleController.createAccrualRule));
router.get('/:id', asyncHandler(leaveAccrualRuleController.getAccrualRule));
router.put('/:id', asyncHandler(leaveAccrualRuleController.updateAccrualRule));
router.delete('/:id', asyncHandler(leaveAccrualRuleController.deleteAccrualRule));

module.exports = router;
