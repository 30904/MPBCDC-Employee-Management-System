const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const loanEligibilityRuleController = require('../controllers/loanEligibilityRuleController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/', validatePaginationMiddleware, asyncHandler(loanEligibilityRuleController.listEligibilityRules));
router.post('/', asyncHandler(loanEligibilityRuleController.createEligibilityRule));
router.get('/:id', asyncHandler(loanEligibilityRuleController.getEligibilityRule));
router.put('/:id', asyncHandler(loanEligibilityRuleController.updateEligibilityRule));
router.delete('/:id', asyncHandler(loanEligibilityRuleController.deleteEligibilityRule));

module.exports = router;
