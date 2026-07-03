function sendSuccess(res, data = null, statusCode = 200) {
  const body = { success: true };
  if (data !== null && data !== undefined) {
    body.data = data;
  }
  return res.status(statusCode).json(body);
}

function sendError(res, error, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: typeof error === 'string' ? error : error?.message || 'Request failed',
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
