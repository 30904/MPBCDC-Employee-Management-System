const LoanApplication = require('../models/LoanApplication');
require('../models/Employee');
const LoanDisbursement = require('../models/LoanDisbursement');
const LoanEmiSchedule = require('../models/LoanEmiSchedule');
const LoanRecovery = require('../models/LoanRecovery');
const AppError = require('../utils/AppError');
const {
  LOAN_RECOVERY_STATUS,
  PAYROLL_MONTH_PATTERN,
} = require('../constants/loanRecoveryStates');
const { parsePagination, executePaginatedQuery } = require('../utils/pagination');

function tenantDisbursements(companyId) {
  return LoanDisbursement.forTenant(companyId);
}

function tenantSchedules(companyId) {
  return LoanEmiSchedule.forTenant(companyId);
}

function tenantRecoveries(companyId) {
  return LoanRecovery.forTenant(companyId);
}

function normalizePayrollMonth(value) {
  return String(value || '').trim();
}

function payrollMonthFromDate(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function validatePayrollMonth(payrollMonth) {
  const normalized = normalizePayrollMonth(payrollMonth);

  if (!PAYROLL_MONTH_PATTERN.test(normalized)) {
    throw new AppError('payrollMonth must be in YYYY-MM format', 400, 'VALIDATION_ERROR');
  }

  return normalized;
}

async function loadActiveDisbursement(companyId, loanNo) {
  const disbursement = await tenantDisbursements(companyId).findOne({
    loanNo,
    status: 'Active',
  });

  if (!disbursement) {
    throw new AppError('Active disbursed loan not found for loanNo', 404, 'NOT_FOUND');
  }

  return disbursement;
}

async function resolveScheduleRow({ companyId, loanNo, payrollMonth, emiNo }) {
  if (emiNo) {
    const row = await tenantSchedules(companyId).findOne({ loanNo, emiNo });
    if (!row) {
      throw new AppError('EMI schedule row not found for loanNo and emiNo', 404, 'NOT_FOUND');
    }
    return row;
  }

  const pendingRows = await tenantSchedules(companyId)
    .find({ loanNo, status: 'Pending' })
    .sort({ emiNo: 1 });

  const matched = pendingRows.find(
    (row) => payrollMonthFromDate(row.dueDate) === payrollMonth
  );

  if (!matched) {
    throw new AppError(
      `No pending EMI found for payroll month ${payrollMonth}`,
      404,
      'EMI_NOT_FOUND'
    );
  }

  return matched;
}

async function listRecoveries({ companyId, query = {} }) {
  const pagination = parsePagination(query);
  const filter = {};

  if (query.loanNo) {
    filter.loanNo = String(query.loanNo).trim();
  }

  if (query.payrollMonth) {
    filter.payrollMonth = validatePayrollMonth(query.payrollMonth);
  }

  if (query.status) {
    filter.status = String(query.status).trim();
  }

  const baseQuery = tenantRecoveries(companyId)
    .find(filter)
    .sort({ recoveryDate: -1, payrollMonth: -1 })
    .populate('employeeId', 'employeeCode')
    .populate('applicationId', 'applicationNo status');

  const { docs, pagination: meta } = await executePaginatedQuery(baseQuery, pagination);

  return { items: docs, pagination: meta };
}

async function listPendingRecoveries({ companyId, payrollMonth }) {
  const month = validatePayrollMonth(payrollMonth);
  const disbursements = await tenantDisbursements(companyId)
    .find({ status: 'Active' })
    .populate('employeeId', 'employeeCode');

  const pending = [];

  for (const disbursement of disbursements) {
    const scheduleRows = await tenantSchedules(companyId)
      .find({ loanNo: disbursement.loanNo, status: 'Pending' })
      .sort({ emiNo: 1 });

    const dueRow = scheduleRows.find((row) => payrollMonthFromDate(row.dueDate) === month);
    if (!dueRow) {
      continue;
    }

    const existing = await tenantRecoveries(companyId).findOne({
      loanNo: disbursement.loanNo,
      payrollMonth: month,
    });

    if (existing) {
      continue;
    }

    pending.push({
      loanNo: disbursement.loanNo,
      applicationId: disbursement.applicationId,
      employeeId: disbursement.employeeId,
      emiNo: dueRow.emiNo,
      payrollMonth: month,
      emiAmount: dueRow.emiAmount,
      dueDate: dueRow.dueDate,
      outstandingBalance: dueRow.outstandingBalance,
    });
  }

  return pending;
}

async function recordRecovery({
  companyId,
  loanNo,
  payrollMonth,
  recoveryDate,
  emiNo,
  status = LOAN_RECOVERY_STATUS.DEDUCTED,
}) {
  const normalizedLoanNo = String(loanNo || '').trim();
  if (!normalizedLoanNo) {
    throw new AppError('loanNo is required', 400, 'VALIDATION_ERROR');
  }

  const month = validatePayrollMonth(payrollMonth);

  if (!Object.values(LOAN_RECOVERY_STATUS).includes(status)) {
    throw new AppError('Invalid recovery status', 400, 'VALIDATION_ERROR');
  }

  const disbursement = await loadActiveDisbursement(companyId, normalizedLoanNo);

  const existing = await tenantRecoveries(companyId).findOne({
    loanNo: normalizedLoanNo,
    payrollMonth: month,
  });

  if (existing) {
    throw new AppError(
      `Recovery already recorded for ${normalizedLoanNo} in ${month}`,
      409,
      'RECOVERY_EXISTS'
    );
  }

  const scheduleRow = await resolveScheduleRow({
    companyId,
    loanNo: normalizedLoanNo,
    payrollMonth: month,
    emiNo,
  });

  if (scheduleRow.status !== 'Pending') {
    throw new AppError('EMI schedule row is not pending deduction', 400, 'INVALID_EMI_STATUS');
  }

  const schedulePayrollMonth = payrollMonthFromDate(scheduleRow.dueDate);
  if (schedulePayrollMonth !== month) {
    throw new AppError(
      `EMI #${scheduleRow.emiNo} is due in ${schedulePayrollMonth}, not ${month}`,
      400,
      'PAYROLL_MONTH_MISMATCH'
    );
  }

  const recoveredOn = recoveryDate ? new Date(recoveryDate) : new Date();
  if (Number.isNaN(recoveredOn.getTime())) {
    throw new AppError('recoveryDate must be a valid date', 400, 'VALIDATION_ERROR');
  }

  const recovery = await tenantRecoveries(companyId).create({
    loanNo: normalizedLoanNo,
    applicationId: disbursement.applicationId,
    employeeId: disbursement.employeeId,
    emiNo: scheduleRow.emiNo,
    payrollMonth: month,
    emiAmount: scheduleRow.emiAmount,
    recoveryDate: recoveredOn,
    status,
    balanceOutstanding: scheduleRow.outstandingBalance,
  });

  if (status === LOAN_RECOVERY_STATUS.DEDUCTED) {
    scheduleRow.status = 'Paid';
    await scheduleRow.save();
  } else if (status === LOAN_RECOVERY_STATUS.SKIPPED) {
    scheduleRow.status = 'Skipped';
    await scheduleRow.save();
  }

  return {
    recovery,
    scheduleRow,
  };
}

module.exports = {
  payrollMonthFromDate,
  listRecoveries,
  listPendingRecoveries,
  recordRecovery,
};
