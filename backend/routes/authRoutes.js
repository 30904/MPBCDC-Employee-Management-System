const express = require('express');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', asyncHandler(authController.login));
router.get('/me', authMiddleware, asyncHandler(authController.getMe));

module.exports = router;
