const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../utils/roles');
const gradeController = require('../controllers/gradeController');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantResolver);
router.use(authorizeRoles(ROLES.CLIENT_ADMIN));

router.get('/', asyncHandler(gradeController.listGrades));
router.post('/', asyncHandler(gradeController.createGrade));
router.put('/:id', asyncHandler(gradeController.updateGrade));

module.exports = router;
