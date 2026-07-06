const AppError = require('../utils/AppError');
const loanDisbursementService = require('../services/loanDisbursementService');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');

async function listPending(req, res) {
  const applications = await loanDisbursementService.listPendingDisbursements({
    companyId: req.companyId,
  });

  return sendSuccess(res, { applications });
}

async function listDisbursements(req, res) {
  const { items, pagination } = await loanDisbursementService.listDisbursements({
    companyId: req.companyId,
    query: req.query,
  });

  return sendPaginatedSuccess(res, items, pagination);
}

async function disburse(req, res) {
  const { applicationId, disbursedAt, firstEmiDate } = req.body;

  if (!applicationId) {
    throw new AppError('applicationId is required', 400, 'VALIDATION_ERROR');
  }

  const result = await loanDisbursementService.disburseApplication({
    companyId: req.companyId,
    applicationId,
    disbursedByUserId: req.user.id,
    disbursedAt,
    firstEmiDate,
  });

  return sendSuccess(res, result, 201);
}

async function getSchedule(req, res) {
  const employeeId = req.selfScope?.employeeId ?? null;

  const result = await loanDisbursementService.getScheduleForApplication({
    companyId: req.companyId,
    applicationId: req.params.applicationId,
    employeeId,
  });

  return sendSuccess(res, result);
}

module.exports = {
  listPending,
  listDisbursements,
  disburse,
  getSchedule,
};
