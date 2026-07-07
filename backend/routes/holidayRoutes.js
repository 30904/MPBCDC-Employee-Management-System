const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validatePaginationMiddleware } = require('../utils/pagination');
const { ROLES } = require('../utils/roles');
const holidayController = require('../controllers/holidayController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN, ROLES.HR_OFFICER));

router.get('/region-options', asyncHandler(holidayController.listRegionOptions));
router.get('/', validatePaginationMiddleware, asyncHandler(holidayController.listHolidays));
router.post('/', asyncHandler(holidayController.createHoliday));
router.get('/:id', asyncHandler(holidayController.getHoliday));
router.put('/:id', asyncHandler(holidayController.updateHoliday));
router.delete('/:id', asyncHandler(holidayController.deleteHoliday));

module.exports = router;
