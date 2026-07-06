const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const { ROLES } = require('../utils/roles');

const MOCK_LOGIN_ID = 'client@celeris.com';
const MOCK_PASSWORD = '12345';

function isMockCredentialMatch(loginId, password) {
  return String(loginId || '').trim().toLowerCase() === MOCK_LOGIN_ID && password === MOCK_PASSWORD;
}

function buildMockClientAdminUser() {
  return {
    _id: new mongoose.Types.ObjectId(),
    loginId: MOCK_LOGIN_ID,
    roles: [ROLES.CLIENT_ADMIN],
    companyId: new mongoose.Types.ObjectId(),
    employeeId: null,
    status: 'Active',
    lastLoginAt: new Date(),
  };
}

function buildToken(user) {
  const payload = {
    userId: user._id.toString(),
    loginId: user.loginId,
    roles: user.roles,
    companyId: user.companyId ? user.companyId.toString() : null,
    employeeId: user.employeeId ? user.employeeId.toString() : null,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    loginId: user.loginId,
    roles: user.roles,
    companyId: user.companyId || null,
    employeeId: user.employeeId || null,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
}

async function login(req, res) {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return sendError(res, 'Login ID and password are required', 400);
  }

  // TEMPORARY MOCK LOGIN: bypass MongoDB only for the known development credential pair.
  if (process.env.NODE_ENV !== 'production' && isMockCredentialMatch(loginId, password)) {
    const mockUser = buildMockClientAdminUser();
    const token = buildToken(mockUser);

    return sendSuccess(res, {
      token,
      user: {
        ...sanitizeUser(mockUser),
        mockLogin: true,
      },
    });
  }

  try {
    const user = await User.findOne({ loginId: loginId.trim() }).select('+passwordHash');

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (user.status !== 'Active') {
      return sendError(res, 'Account is inactive', 403);
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.roles.includes(ROLES.SUPER_ADMIN) && !user.companyId) {
      return sendError(res, 'Tenant context missing for user', 403);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = buildToken(user);

    return sendSuccess(res, {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    throw error;
  }
}

async function getMe(req, res) {
  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, sanitizeUser(user));
}

module.exports = {
  login,
  getMe,
  buildToken,
  sanitizeUser,
};
