const express = require('express');
const companyController = require('../controllers/companyController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.get('/', asyncHandler(companyController.listCompanies));
router.post('/', asyncHandler(companyController.createCompany));
router.get('/:id', asyncHandler(companyController.getCompany));
router.put('/:id', asyncHandler(companyController.updateCompany));
router.get('/:id/users', asyncHandler(companyController.listCompanyUsers));
router.post('/:id/users', asyncHandler(companyController.createCompanyUser));

module.exports = router;
