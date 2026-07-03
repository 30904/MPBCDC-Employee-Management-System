/**
 * Standard API response envelope (MPBCDC convention).
 *
 * Success: { success: true, data: ... }
 * Error:   { success: false, error: "message" }
 */

function createSuccessBody(data = null, meta = null) {
  const body = { success: true };

  if (data !== null && data !== undefined) {
    body.data = data;
  }

  if (meta) {
    body.meta = meta;
  }

  return body;
}

function createErrorBody(error, code = null) {
  const body = {
    success: false,
    error: typeof error === 'string' ? error : error?.message || 'Request failed',
  };

  if (code) {
    body.code = code;
  }

  return body;
}

function sendSuccess(res, data = null, statusCode = 200, meta = null) {
  return res.status(statusCode).json(createSuccessBody(data, meta));
}

function sendError(res, error, statusCode = 400, code = null) {
  return res.status(statusCode).json(createErrorBody(error, code));
}

function sendPaginatedSuccess(res, data, pagination, statusCode = 200) {
  return sendSuccess(res, data, statusCode, { pagination });
}

module.exports = {
  createSuccessBody,
  createErrorBody,
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
};
