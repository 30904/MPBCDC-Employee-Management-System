const { sendSuccess } = require('../utils/apiResponse');

function buildResponse(req, moduleName, action, extra = {}) {
  return {
    module: moduleName,
    action,
    companyId: req.selfScope?.companyId || req.companyId || null,
    employeeId: req.selfScope?.employeeId || null,
    userId: req.selfScope?.userId || null,
    ...extra,
  };
}

async function applyLeave(req, res) {
  return sendSuccess(
    res,
    buildResponse(req, 'leave', 'apply', {
      requestedEmployeeId: req.body?.employeeId || null,
    }),
    201
  );
}

async function leaveHistory(req, res) {
  return sendSuccess(res, buildResponse(req, 'leave', 'history'));
}

async function leaveBalance(req, res) {
  return sendSuccess(res, buildResponse(req, 'leave', 'balance'));
}

async function applyLoan(req, res) {
  return sendSuccess(
    res,
    buildResponse(req, 'loan', 'apply', {
      requestedEmployeeId: req.body?.employeeId || null,
    }),
    201
  );
}

async function appliedLoans(req, res) {
  return sendSuccess(res, buildResponse(req, 'loan', 'applied'));
}

async function repaymentSchedule(req, res) {
  return sendSuccess(
    res,
    buildResponse(req, 'loan', 'schedule', {
      loanApplicationId: req.params.id,
    })
  );
}

module.exports = {
  applyLeave,
  leaveHistory,
  leaveBalance,
  applyLoan,
  appliedLoans,
  repaymentSchedule,
};