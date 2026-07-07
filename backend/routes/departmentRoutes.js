const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/roles');
const departmentController = require('../controllers/departmentController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/', asyncHandler(departmentController.listDepartments));
router.post('/', asyncHandler(departmentController.createDepartment));
router.put('/:id', asyncHandler(departmentController.updateDepartment));

module.exports = router;