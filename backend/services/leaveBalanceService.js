const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/LeaveType');
const AppError = require('../utils/AppError');

function computeClosingBalance(balance) {
  const opening = Number(balance.openingBalance) || 0;
  const accrued = Number(balance.accrued) || 0;
  const availed = Number(balance.availed) || 0;
  const lapsed = Number(balance.lapsed) || 0;
  const encashed = Number(balance.encashed) || 0;
  const adjustment = Number(balance.adjustment) || 0;

  return Number((opening + accrued + adjustment - availed - lapsed - encashed).toFixed(2));
}

function resolvePeriod(fromDate) {
  const date = fromDate ? new Date(fromDate) : new Date();
  return String(date.getFullYear());
}

/**
 * Deduct approved leave days from the employee leave balance ledger.
 * Creates a period row if none exists (seeded from leave type annual entitlement).
 */
async function deductOnApproval({
  companyId,
  employeeId,
  leaveTypeId,
  days,
  fromDate,
  applicationNo,
}) {
  const charge = Number(days);

  if (!Number.isFinite(charge) || charge <= 0) {
    return null;
  }

  const period = resolvePeriod(fromDate);
  const Model = LeaveBalance.forTenant(companyId);

  let balance = await Model.findOne({ employeeId, leaveTypeId, period });

  if (!balance) {
    const leaveType = await LeaveType.forTenant(companyId).findById(leaveTypeId);
    const entitlement = Number(leaveType?.annualEntitlement) || 0;

    balance = await Model.create({
      employeeId,
      leaveTypeId,
      period,
      openingBalance: entitlement,
      accrued: 0,
      availed: 0,
      lapsed: 0,
      encashed: 0,
      adjustment: 0,
      closingBalance: entitlement,
      remarks: `Opening balance seeded from ${leaveType?.code || 'leave type'} entitlement`,
    });
  }

  const available = computeClosingBalance(balance);

  if (available < charge) {
    throw new AppError(
      `Insufficient leave balance for period ${period}. Available: ${available}, required: ${charge}`,
      400,
      'INSUFFICIENT_LEAVE_BALANCE'
    );
  }

  balance.availed = Number(((Number(balance.availed) || 0) + charge).toFixed(2));
  balance.closingBalance = computeClosingBalance(balance);
  balance.remarks = applicationNo
    ? `Deducted ${charge} day(s) for ${applicationNo}`
    : `Deducted ${charge} day(s) on approval`;

  await balance.save();
  return balance;
}

module.exports = {
  computeClosingBalance,
  resolvePeriod,
  deductOnApproval,
};
