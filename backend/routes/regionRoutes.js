const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/roles');
const regionController = require('../controllers/regionController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/', asyncHandler(regionController.listRegions));
router.post('/', asyncHandler(regionController.createRegion));
router.put('/:id', asyncHandler(regionController.updateRegion));

module.exports = router;
