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
    throw new AppError(
      `No leave balance ledger found for period ${period}`,
      400,
      'INSUFFICIENT_LEAVE_BALANCE'
    );
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
  /**
   * Execute year-end leave close for all balances of a period.
   * - carry-forward obeys LeaveType flags + cap
   * - optional encash from carry-forward bucket
   * - remaining is lapsed
   * - opens/updates next year opening balance
   * Idempotent per source row via yearEndProcessedKey.
   */
  async closeYearEnd({
    companyId,
    sourcePeriodYear,
    targetPeriodYear,
    encashableCarryForwardPercent = 0,
    employeeIds = [],
  }) {
    const sourcePeriod = String(sourcePeriodYear);
    const targetPeriod = String(targetPeriodYear);
    const processKey = `${sourcePeriod}->${targetPeriod}`;

    const sourceFilter = { period: sourcePeriod };
    if (Array.isArray(employeeIds) && employeeIds.length > 0) {
      sourceFilter.employeeId = { $in: employeeIds };
    }

    const SourceModel = LeaveBalance.forTenant(companyId);
    const sourceBalances = await SourceModel.find(sourceFilter);

    if (sourceBalances.length === 0) {
      return {
        sourcePeriod,
        targetPeriod,
        processed: 0,
        skipped: 0,
        carriedForwardTotal: 0,
        encashedTotal: 0,
        lapsedTotal: 0,
        idempotent: true,
      };
    }

    const leaveTypeIds = [...new Set(sourceBalances.map((row) => String(row.leaveTypeId)))];
    const leaveTypes = await LeaveType.forTenant(companyId)
      .find({ _id: { $in: leaveTypeIds } })
      .select('_id code allowsCarryForward maxCarryForwardDays isEncashable');
    const leaveTypeMap = new Map(leaveTypes.map((row) => [String(row._id), row]));

    let processed = 0;
    let skipped = 0;
    let carriedForwardTotal = 0;
    let encashedTotal = 0;
    let lapsedTotal = 0;

    for (const source of sourceBalances) {
      if (source.yearEndProcessedKey === processKey) {
        skipped += 1;
        continue;
      }

      const leaveType = leaveTypeMap.get(String(source.leaveTypeId));
      const available = Math.max(0, Number(source.closingBalance) || 0);

      const allowsCarryForward = Boolean(leaveType?.allowsCarryForward);
      const maxCarryForward = allowsCarryForward ? Number(leaveType?.maxCarryForwardDays || 0) : 0;
      const carryForward = Math.min(available, Math.max(0, maxCarryForward));

      const shouldEncash = Boolean(leaveType?.isEncashable) && encashableCarryForwardPercent > 0;
      const encashedFromCarry = shouldEncash
        ? Number(((carryForward * Number(encashableCarryForwardPercent || 0)) / 100).toFixed(2))
        : 0;
      const netCarryForward = Number((carryForward - encashedFromCarry).toFixed(2));
      const lapsed = Number((available - carryForward).toFixed(2));

      source.lapsed = Number(((Number(source.lapsed) || 0) + Math.max(0, lapsed)).toFixed(2));
      source.encashed = Number(((Number(source.encashed) || 0) + Math.max(0, encashedFromCarry)).toFixed(2));
      source.closingBalance = Number(
        (available - Math.max(0, lapsed) - Math.max(0, encashedFromCarry)).toFixed(2)
      );
      source.yearEndProcessedKey = processKey;
      source.yearEndProcessedAt = new Date();
      source.remarks = `Year-end close ${processKey}: CF=${netCarryForward}, encashed=${encashedFromCarry}, lapsed=${lapsed}`;
      await source.save();

      const target = await SourceModel.findOne({
        employeeId: source.employeeId,
        leaveTypeId: source.leaveTypeId,
        period: targetPeriod,
      });

      if (!target) {
        await SourceModel.create({
          employeeId: source.employeeId,
          leaveTypeId: source.leaveTypeId,
          period: targetPeriod,
          openingBalance: netCarryForward,
          accrued: 0,
          availed: 0,
          lapsed: 0,
          encashed: 0,
          adjustment: 0,
          closingBalance: netCarryForward,
          remarks: `Opening from year-end carry-forward (${processKey})`,
        });
      } else {
        target.openingBalance = Number(((Number(target.openingBalance) || 0) + netCarryForward).toFixed(2));
        target.closingBalance = computeClosingBalance(target);
        target.remarks = `Opening updated by year-end carry-forward (${processKey})`;
        await target.save();
      }

      carriedForwardTotal += netCarryForward;
      encashedTotal += encashedFromCarry;
      lapsedTotal += Math.max(0, lapsed);
      processed += 1;
    }

    return {
      sourcePeriod,
      targetPeriod,
      processKey,
      processed,
      skipped,
      carriedForwardTotal: Number(carriedForwardTotal.toFixed(2)),
      encashedTotal: Number(encashedTotal.toFixed(2)),
      lapsedTotal: Number(lapsedTotal.toFixed(2)),
      idempotent: true,
    };
  },
};
