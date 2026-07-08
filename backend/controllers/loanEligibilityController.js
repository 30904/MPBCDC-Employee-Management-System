const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const { previewEligibility } = require('../services/loanEligibilityService');

async function previewLoanEligibility(req, res) {
  const { loanTypeId, requestedAmount, requestedTenure, emiStartDate } = req.query;
  const employeeId = req.selfScope?.employeeId;

  if (!employeeId) {
    throw new AppError('Employee context is required', 403, 'EMPLOYEE_SCOPE_REQUIRED');
  }

  if (!loanTypeId) {
    throw new AppError('loanTypeId query parameter is required', 400, 'VALIDATION_ERROR');
  }

  const amount = Number(requestedAmount);
  const tenure = Number(requestedTenure);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('requestedAmount must be a positive number', 400, 'VALIDATION_ERROR');
  }

  if (!Number.isFinite(tenure) || tenure <= 0) {
    throw new AppError('requestedTenure must be a positive integer', 400, 'VALIDATION_ERROR');
  }

  if (emiStartDate) {
    const parsedStart = new Date(emiStartDate);
    if (Number.isNaN(parsedStart.getTime())) {
      throw new AppError('emiStartDate must be a valid date', 400, 'VALIDATION_ERROR');
    }
  }

  const result = await previewEligibility({
    companyId: req.companyId,
    employeeId,
    loanTypeId,
    requestedAmount: amount,
    requestedTenure: tenure,
    emiStartDate: emiStartDate || null,
  });

  return sendSuccess(res, result);
}

module.exports = {
  previewLoanEligibility,
};
