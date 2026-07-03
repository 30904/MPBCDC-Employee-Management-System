const { sendError } = require('../utils/apiResponse');

function notFoundHandler(_req, res) {
  return sendError(res, 'Route not found', 404);
}

function errorHandler(err, _req, res, _next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return sendError(res, message, statusCode);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
