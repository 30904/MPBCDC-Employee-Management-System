const { sendError } = require('../utils/apiResponse');

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const hasPermission = allowedRoles.some((role) => req.user.roles.includes(role));

    if (!hasPermission) {
      return sendError(res, 'You do not have permission to perform this action', 403);
    }

    return next();
  };
}

module.exports = authorizeRoles;
