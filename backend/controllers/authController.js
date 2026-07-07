const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Company = require('../models/Company');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const { ROLES } = require('../utils/roles');
const { belongsToTenant } = require('../utils/tenantQuery');

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

function sanitizeUser(user, company = null) {
  return {
    id: user._id,
    loginId: user.loginId,
    roles: user.roles,
    companyId: user.companyId || null,
    companyCode: company?.code ?? null,
    companyName: company?.name ?? null,
    employeeId: user.employeeId || null,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
}

async function loadCompanyForUser(user) {
  if (!user?.companyId) {
    return null;
  }

  return Company.findById(user.companyId).select('name code status').lean();
}

async function resolveLoginCandidates(loginId, companyCode) {
  const normalizedLoginId = String(loginId || '').trim();

  if (!normalizedLoginId) {
    return { error: sendErrorPayload('Login ID and password are required', 400) };
  }

  let candidates = await User.find({ loginId: normalizedLoginId }).select('+passwordHash');

  if (!candidates.length) {
    return { error: sendErrorPayload('Invalid credentials', 401) };
  }

  if (companyCode) {
    const company = await Company.findOne({
      code: String(companyCode).trim().toUpperCase(),
      status: 'Active',
    });

    if (!company) {
      return { error: sendErrorPayload('Company not found for the code provided', 404, 'COMPANY_NOT_FOUND') };
    }

    candidates = candidates.filter(
      (candidate) => String(candidate.companyId) === String(company._id)
    );

    if (!candidates.length) {
      return { error: sendErrorPayload('Invalid credentials', 401) };
    }
  }

  return { candidates };
}

function sendErrorPayload(message, status, code) {
  return { message, status, code };
}

async function login(req, res) {
  const { loginId, password, companyCode } = req.body;

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

  const resolved = await resolveLoginCandidates(loginId, companyCode);

  if (resolved.error) {
    const { message, status, code } = resolved.error;
    return sendError(res, message, status, code);
  }

  let user = null;

  for (const candidate of resolved.candidates) {
    const passwordMatch = await candidate.comparePassword(password);
    if (passwordMatch) {
      user = candidate;
      break;
    }
  }

  if (!user) {
    return sendError(res, 'Invalid credentials', 401);
  }

  if (user.status !== 'Active') {
    return sendError(res, 'Account is inactive', 403);
  }

  if (user.employeeId) {
    const employee = await Employee.findById(user.employeeId).select('status');

    if (!employee || employee.status !== 'Active') {
      return sendError(res, 'Employee account is inactive', 403);
    }
  }

  if (!user.roles.includes(ROLES.SUPER_ADMIN) && !user.companyId) {
    return sendError(res, 'Tenant context missing for user', 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const company = await loadCompanyForUser(user);
  const token = buildToken(user);

  return sendSuccess(res, {
    token,
    user: sanitizeUser(user, company),
  });
}

async function getMe(req, res) {
  let user;

  if (req.companyId) {
    user = await User.forTenant(req.companyId).findById(req.user.id);
  } else {
    user = await User.findById(req.user.id);
  }

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  if (req.companyId && user.companyId && !belongsToTenant(user, req.companyId)) {
    return sendError(res, 'Access denied', 403);
  }

  const company = await loadCompanyForUser(user);

  return sendSuccess(res, sanitizeUser(user, company));
}

module.exports = {
  login,
  getMe,
  buildToken,
  sanitizeUser,
};
