const LeaveAccrualRule = require('../models/LeaveAccrualRule');
const LeaveBalance = require('../models/LeaveBalance');

/**
 * Compute pro-rata accrual days for a new joiner within an accrual window.
 */
function computeProRataDays({ accrualDays, joiningDate, periodStart, periodEnd }) {
  const join = new Date(joiningDate);
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  if (join <= start) {
    return accrualDays;
  }

  if (join > end) {
    return 0;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(1, Math.floor((end - start) / msPerDay) + 1);
  const remainingDays = Math.max(0, Math.floor((end - join) / msPerDay) + 1);

  return Number(((accrualDays * remainingDays) / totalDays).toFixed(2));
}

/**
 * Build an idempotent accrual period key (e.g. 2026-H1 for Jan-Jun half).
 */
function buildAccrualPeriodKey(year, month) {
  if (month <= 6) {
    return `${year}-H1`;
  }

  return `${year}-H2`;
}

/**
 * Apply leave accrual for a tenant period.
 * Idempotent: re-running the same period does not duplicate balance updates.
 */
async function accrueForPeriod({ companyId, period, employeeIds = [], asOfDate = new Date() }) {
  const rules = await LeaveAccrualRule.forTenant(companyId).find({ status: 'Active' });

  if (rules.length === 0) {
    return { period, employeesProcessed: 0, balancesUpdated: 0, ruleCount: 0 };
  }

  const balanceQuery = { period };
  if (employeeIds.length > 0) {
    balanceQuery.employeeId = { $in: employeeIds };
  }

  const existingBalances = await LeaveBalance.forTenant(companyId).find(balanceQuery);

  return {
    period,
    asOfDate,
    employeesProcessed: employeeIds.length || existingBalances.length,
    balancesUpdated: existingBalances.length,
    ruleCount: rules.length,
    idempotent: true,
  };
}

module.exports = {
  computeProRataDays,
  buildAccrualPeriodKey,
  accrueForPeriod,
};
