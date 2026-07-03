const { sendError } = require('../utils/apiResponse');

function formatMongooseError(err) {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return { message: messages.join(', '), statusCode: 400, code: 'VALIDATION_ERROR' };
  }

  if (err.name === 'CastError') {
    return { message: 'Invalid resource identifier', statusCode: 400, code: 'INVALID_ID' };
  }

  if (err.code === 11000) {
    return { message: 'Duplicate record already exists', statusCode: 409, code: 'DUPLICATE_KEY' };
  }

  return null;
}

function notFoundHandler(_req, res) {
  return sendError(res, 'Route not found', 404, 'NOT_FOUND');
}

function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.name === 'AppError') {
    return sendError(res, err.message, err.statusCode, err.code);
  }

  const mongooseError = formatMongooseError(err);
  if (mongooseError) {
    return sendError(res, mongooseError.message, mongooseError.statusCode, mongooseError.code);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = statusCode === 500 ? 'INTERNAL_ERROR' : null;

  return sendError(res, message, statusCode, code);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
