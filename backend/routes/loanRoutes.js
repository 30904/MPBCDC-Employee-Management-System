const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const assertEmployeeSelfScope = require('../middleware/employeeSelfScope');
const { ROLES } = require('../utils/roles');
const loanController = require('../controllers/employeeSelfServiceController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.EMPLOYEE));
router.use(assertEmployeeSelfScope);

router.post('/apply', asyncHandler(loanController.applyLoan));
router.get('/applied', asyncHandler(loanController.appliedLoans));
router.get('/:id/schedule', asyncHandler(loanController.repaymentSchedule));

module.exports = router;