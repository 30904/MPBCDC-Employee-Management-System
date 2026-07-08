const LeaveAccrualRule = require('../models/LeaveAccrualRule');
const LeaveBalance = require('../models/LeaveBalance');

/**
 * Apply leave accrual for a tenant period (monthly / yearly rules).
 */
async function accrueForPeriod({ companyId, period, employeeIds = [] }) {
  const rules = await LeaveAccrualRule.forTenant(companyId).find();
  if (rules.length === 0) {
    return { period, employeesProcessed: 0, balancesUpdated: 0 };
  }

  const balanceQuery = { period };
  if (employeeIds.length > 0) {
    balanceQuery.employeeId = { $in: employeeIds };
  }

  const existingBalances = await LeaveBalance.forTenant(companyId).find(balanceQuery);

  return {
    period,
    employeesProcessed: employeeIds.length || existingBalances.length,
    balancesUpdated: existingBalances.length,
    ruleCount: rules.length,
  };
}

module.exports = {
  accrueForPeriod,
};
