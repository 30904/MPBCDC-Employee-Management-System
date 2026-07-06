const express = require('express');
const companyController = require('../controllers/companyController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.get('/', validatePaginationMiddleware, asyncHandler(companyController.listCompanies));
router.post('/', asyncHandler(companyController.createCompany));
router.get('/:id', asyncHandler(companyController.getCompany));
router.put('/:id', asyncHandler(companyController.updateCompany));
router.get('/:id/users', validatePaginationMiddleware, asyncHandler(companyController.listCompanyUsers));
router.post('/:id/users', asyncHandler(companyController.createCompanyUser));

module.exports = router;
