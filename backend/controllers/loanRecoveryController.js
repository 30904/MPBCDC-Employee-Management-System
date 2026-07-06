const AppError = require('../utils/AppError');
const loanRecoveryService = require('../services/loanRecoveryService');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');

async function listRecoveries(req, res) {
  const { items, pagination } = await loanRecoveryService.listRecoveries({
    companyId: req.companyId,
    query: req.query,
  });

  return sendPaginatedSuccess(res, items, pagination);
}

async function listPending(req, res) {
  const { payrollMonth } = req.query;

  if (!payrollMonth) {
    throw new AppError('payrollMonth query parameter is required', 400, 'VALIDATION_ERROR');
  }

  const items = await loanRecoveryService.listPendingRecoveries({
    companyId: req.companyId,
    payrollMonth,
  });

  return sendSuccess(res, { items, payrollMonth });
}

async function recordRecovery(req, res) {
  const { loanNo, payrollMonth, recoveryDate, emiNo, status } = req.body;

  const result = await loanRecoveryService.recordRecovery({
    companyId: req.companyId,
    loanNo,
    payrollMonth,
    recoveryDate,
    emiNo,
    status,
  });

  return sendSuccess(res, result, 201);
}

module.exports = {
  listRecoveries,
  listPending,
  recordRecovery,
};
