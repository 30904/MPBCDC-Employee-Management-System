const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/roles');
const leaveReportController = require('../controllers/leaveReportController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/summary.csv', asyncHandler(leaveReportController.downloadLeaveSummaryCsv));
router.get('/summary', asyncHandler(leaveReportController.getLeaveSummaryReport));
router.get('/details', asyncHandler(leaveReportController.getLeaveDetailsReport));

module.exports = router;
