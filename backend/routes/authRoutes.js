const express = require('express');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.post('/login', asyncHandler(authController.login));
router.get(
	'/me',
	authMiddleware,
	tenantResolver,
	authorizeRoles(...Object.values(ROLES)),
	asyncHandler(authController.getMe)
);

module.exports = router;
