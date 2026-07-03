const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');
const { ALL_ROLES } = require('../utils/roles');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const roles = Array.isArray(decoded.roles) ? decoded.roles : [];

    const invalidRole = roles.find((role) => !ALL_ROLES.includes(role));
    if (invalidRole) {
      return sendError(res, 'Invalid role in token', 401);
    }

    req.user = {
      id: decoded.userId,
      loginId: decoded.loginId,
      roles,
      companyId: decoded.companyId || null,
      employeeId: decoded.employeeId || null,
    };

    return next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

module.exports = authMiddleware;
