const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/roles');
const districtController = require('../controllers/districtController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/', asyncHandler(districtController.listDistricts));
router.post('/', asyncHandler(districtController.createDistrict));
router.put('/:id', asyncHandler(districtController.updateDistrict));

module.exports = router;
