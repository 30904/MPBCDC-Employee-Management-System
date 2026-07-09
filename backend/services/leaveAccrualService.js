const Employee = require('../models/Employee');
const LeaveAccrualRule = require('../models/LeaveAccrualRule');
const LeaveBalance = require('../models/LeaveBalance');
const { computeClosingBalance } = require('./leaveBalanceService');

/**
 * Compute pro-rata accrual days for a new joiner within an accrual window.
 */
function computeProRataDays({ accrualDays, joiningDate, periodStart, periodEnd }) {
  const join = new Date(joiningDate);
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  if (Number.isNaN(join.getTime()) || join <= start) {
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

function buildMonthlyPeriodKey(year, month) {
  return `${year}-M${String(month).padStart(2, '0')}`;
}

function buildYearlyPeriodKey(year) {
  return `${year}-Y`;
}

function resolveRunPeriodKey({ year, month, frequency }) {
  const freq = String(frequency || '').toUpperCase();

  if (freq === 'MONTHLY') {
    return buildMonthlyPeriodKey(year, month);
  }

  if (freq === 'YEARLY') {
    return buildYearlyPeriodKey(year);
  }

  return buildAccrualPeriodKey(year, month);
}

function getPeriodWindow(runPeriodKey) {
  const halfMatch = /^(\d{4})-H([12])$/.exec(runPeriodKey);
  if (halfMatch) {
    const year = Number(halfMatch[1]);
    const half = Number(halfMatch[2]);
    if (half === 1) {
      return {
        periodStart: new Date(Date.UTC(year, 0, 1)),
        periodEnd: new Date(Date.UTC(year, 5, 30, 23, 59, 59, 999)),
        balancePeriod: String(year),
      };
    }

    return {
      periodStart: new Date(Date.UTC(year, 6, 1)),
      periodEnd: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
      balancePeriod: String(year),
    };
  }

  const monthMatch = /^(\d{4})-M(\d{2})$/.exec(runPeriodKey);
  if (monthMatch) {
    const year = Number(monthMatch[1]);
    const monthIndex = Number(monthMatch[2]) - 1;
    const periodStart = new Date(Date.UTC(year, monthIndex, 1));
    const periodEnd = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
    return { periodStart, periodEnd, balancePeriod: String(year) };
  }

  const yearMatch = /^(\d{4})-Y$/.exec(runPeriodKey);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    return {
      periodStart: new Date(Date.UTC(year, 0, 1)),
      periodEnd: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
      balancePeriod: String(year),
    };
  }

  const yearOnly = Number(String(runPeriodKey).slice(0, 4));
  const safeYear = Number.isFinite(yearOnly) ? yearOnly : new Date().getFullYear();
  return {
    periodStart: new Date(Date.UTC(safeYear, 0, 1)),
    periodEnd: new Date(Date.UTC(safeYear, 11, 31, 23, 59, 59, 999)),
    balancePeriod: String(safeYear),
  };
}

function isRuleDueForMonth(rule, month) {
  const frequency = String(rule.accrualFrequency || '').toUpperCase();
  const scheduled = Array.isArray(rule.scheduledMonths) ? rule.scheduledMonths : [];

  if (frequency === 'MONTHLY') {
    return true;
  }

  if (scheduled.length === 0) {
    return false;
  }

  return scheduled.includes(Number(month));
}

function isRuleEffective(rule, asOfDate) {
  if (!rule.effectiveDate) {
    return true;
  }

  return new Date(rule.effectiveDate) <= new Date(asOfDate);
}

/**
 * Apply leave accrual for a tenant period.
 * Idempotent: re-running the same period does not duplicate balance updates.
 */
async function accrueForPeriod({ companyId, period, employeeIds = [], asOfDate = new Date() }) {
  const asOf = new Date(asOfDate);
  const year = asOf.getUTCFullYear();
  const month = asOf.getUTCMonth() + 1;
  const explicitPeriod = period ? String(period).trim().toUpperCase() : null;

  const rules = await LeaveAccrualRule.forTenant(companyId).find({ status: 'Active' });

  if (rules.length === 0) {
    return {
      period: explicitPeriod || buildAccrualPeriodKey(year, month),
      asOfDate: asOf,
      employeesProcessed: 0,
      balancesUpdated: 0,
      balancesSkipped: 0,
      ruleCount: 0,
      idempotent: true,
    };
  }

  const employeeFilter = { companyId, status: 'Active' };
  if (employeeIds.length > 0) {
    employeeFilter._id = { $in: employeeIds };
  }

  const employees = await Employee.find(employeeFilter).select('_id joiningDate employeeCode');

  let balancesUpdated = 0;
  let balancesSkipped = 0;
  const runKeys = new Set();

  for (const rule of rules) {
    if (!isRuleEffective(rule, asOf)) {
      continue;
    }

    // Explicit period = intentional backfill/admin run; otherwise only post when month is due.
    if (!explicitPeriod && !isRuleDueForMonth(rule, month)) {
      continue;
    }

    const runPeriodKey =
      explicitPeriod ||
      resolveRunPeriodKey({
        year,
        month,
        frequency: rule.accrualFrequency,
      });
    runKeys.add(runPeriodKey);

    const { periodStart, periodEnd, balancePeriod } = getPeriodWindow(runPeriodKey);

    for (const employee of employees) {
      let days = Number(rule.accrualDays) || 0;

      if (rule.applyProRata) {
        days = computeProRataDays({
          accrualDays: days,
          joiningDate: employee.joiningDate,
          periodStart,
          periodEnd,
        });
      }

      if (days <= 0) {
        balancesSkipped += 1;
        continue;
      }

      const BalanceModel = LeaveBalance.forTenant(companyId);
      let balance = await BalanceModel.findOne({
        employeeId: employee._id,
        leaveTypeId: rule.leaveTypeId,
        period: balancePeriod,
      });

      if (balance && balance.lastAccrualPeriodKey === runPeriodKey) {
        balancesSkipped += 1;
        continue;
      }

      if (!balance) {
        balance = await BalanceModel.create({
          employeeId: employee._id,
          leaveTypeId: rule.leaveTypeId,
          period: balancePeriod,
          openingBalance: 0,
          accrued: 0,
          availed: 0,
          lapsed: 0,
          encashed: 0,
          adjustment: 0,
          closingBalance: 0,
        });
      }

      const limit = Number(rule.accumulationLimit);
      const nextAccrued = Number(((Number(balance.accrued) || 0) + days).toFixed(2));
      const projectedClosing = computeClosingBalance({
        ...balance.toObject(),
        accrued: nextAccrued,
      });

      if (Number.isFinite(limit) && limit > 0 && projectedClosing > limit) {
        const allowedDays = Number((limit - computeClosingBalance(balance)).toFixed(2));
        if (allowedDays <= 0) {
          balancesSkipped += 1;
          continue;
        }
        days = allowedDays;
      }

      balance.accrued = Number(((Number(balance.accrued) || 0) + days).toFixed(2));
      balance.closingBalance = computeClosingBalance(balance);
      balance.lastAccruedAt = asOf;
      balance.lastAccrualPeriodKey = runPeriodKey;
      balance.remarks = `Accrued ${days} day(s) for ${runPeriodKey} via ${rule.ruleCode}`;
      await balance.save();
      balancesUpdated += 1;
    }
  }

  return {
    period: period || [...runKeys][0] || buildAccrualPeriodKey(year, month),
    periods: [...runKeys],
    asOfDate: asOf,
    employeesProcessed: employees.length,
    balancesUpdated,
    balancesSkipped,
    ruleCount: rules.length,
    idempotent: true,
  };
}

module.exports = {
  computeProRataDays,
  buildAccrualPeriodKey,
  buildMonthlyPeriodKey,
  buildYearlyPeriodKey,
  resolveRunPeriodKey,
  getPeriodWindow,
  accrueForPeriod,
};
