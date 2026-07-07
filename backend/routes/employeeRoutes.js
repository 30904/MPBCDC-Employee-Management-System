const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/roles');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.post('/with-account', authorizeRoles(ROLES.CLIENT_ADMIN), asyncHandler(employeeController.createEmployeeWithAccount));
router.get('/', asyncHandler(employeeController.listEmployees));
router.get('/:id', asyncHandler(employeeController.getEmployee));
router.post('/', asyncHandler(employeeController.createEmployee));
router.put('/:id', asyncHandler(employeeController.updateEmployee));
router.delete('/:id', asyncHandler(employeeController.deleteEmployee));

module.exports = router;