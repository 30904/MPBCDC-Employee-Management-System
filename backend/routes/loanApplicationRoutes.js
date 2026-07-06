const express = require('express');

const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = require('../middleware/authMiddleware');

const tenantResolver = require('../middleware/tenantResolver');

const authorizeRoles = require('../middleware/authorizeRoles');

const assertEmployeeSelfScope = require('../middleware/employeeSelfScope');

const { validatePaginationMiddleware } = require('../utils/pagination');

const { ROLES } = require('../utils/roles');

const loanApplicationController = require('../controllers/loanApplicationController');



const APPROVER_ROLES = [

  ROLES.CLIENT_ADMIN,

  ROLES.REPORTING_MANAGER,

  ROLES.HR_OFFICER,

  ROLES.FINANCE_OFFICER,

];



const router = express.Router();



router.use(authMiddleware);

router.use(tenantResolver);



router.get(

  '/queue',

  authorizeRoles(...APPROVER_ROLES),

  asyncHandler(loanApplicationController.listApprovalQueue)

);



router.get(

  '/mine',

  authorizeRoles(ROLES.EMPLOYEE),

  assertEmployeeSelfScope,

  validatePaginationMiddleware,

  asyncHandler(loanApplicationController.listMyApplications)

);



router.get(

  '/',

  authorizeRoles(ROLES.CLIENT_ADMIN),

  validatePaginationMiddleware,

  asyncHandler(loanApplicationController.listApplications)

);



router.post(

  '/',

  authorizeRoles(ROLES.EMPLOYEE),

  assertEmployeeSelfScope,

  asyncHandler(loanApplicationController.createApplication)

);



router.put(

  '/:id/submit',

  authorizeRoles(ROLES.EMPLOYEE),

  assertEmployeeSelfScope,

  asyncHandler(loanApplicationController.submitApplication)

);



router.post(

  '/:id/decision',

  authorizeRoles(...APPROVER_ROLES),

  asyncHandler(loanApplicationController.recordApprovalDecision)

);



router.get(

  '/:id',

  authorizeRoles(ROLES.CLIENT_ADMIN, ROLES.EMPLOYEE, ...APPROVER_ROLES),

  assertEmployeeSelfScope,

  asyncHandler(loanApplicationController.getApplication)

);



module.exports = router;

