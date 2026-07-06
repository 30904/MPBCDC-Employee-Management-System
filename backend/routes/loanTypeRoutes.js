const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const loanTypeController = require('../controllers/loanTypeController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/', validatePaginationMiddleware, asyncHandler(loanTypeController.listLoanTypes));
router.post('/', asyncHandler(loanTypeController.createLoanType));
router.get('/:id', asyncHandler(loanTypeController.getLoanType));
router.put('/:id', asyncHandler(loanTypeController.updateLoanType));
router.delete('/:id', asyncHandler(loanTypeController.deleteLoanType));

module.exports = router;
