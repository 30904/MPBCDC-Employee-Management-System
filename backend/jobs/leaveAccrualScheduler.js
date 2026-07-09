const Company = require('../models/Company');
const leaveAccrualService = require('../services/leaveAccrualService');

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
let timer = null;
let running = false;

/**
 * Run tenant accrual on Jan 1 and Jul 1 (UTC) when scheduler is enabled.
 */
async function runScheduledAccrualIfDue() {
  if (running) {
    return;
  }

  running = true;

  try {
    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();

    if (day !== 1 || ![1, 7].includes(month)) {
      return;
    }

    const companies = await Company.find({ status: 'Active' }).select('_id name code');
    const results = [];

    for (const company of companies) {
      const result = await leaveAccrualService.accrueForPeriod({
        companyId: company._id,
        asOfDate: now,
      });
      results.push({ companyId: company._id, companyCode: company.code, ...result });
    }

    if (results.length > 0) {
      console.log(`[leave-accrual-scheduler] processed ${results.length} tenant(s) on ${now.toISOString()}`);
    }
  } catch (error) {
    console.error('[leave-accrual-scheduler] failed:', error.message);
  } finally {
    running = false;
  }
}

function startLeaveAccrualScheduler() {
  if (process.env.LEAVE_ACCRUAL_SCHEDULER_ENABLED !== 'true') {
    return;
  }

  if (timer) {
    return;
  }

  runScheduledAccrualIfDue().catch(() => {});
  timer = setInterval(() => {
    runScheduledAccrualIfDue().catch(() => {});
  }, CHECK_INTERVAL_MS);

  console.log('[leave-accrual-scheduler] enabled (checks hourly; posts on Jan 1 & Jul 1 UTC)');
}

function stopLeaveAccrualScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  startLeaveAccrualScheduler,
  stopLeaveAccrualScheduler,
  runScheduledAccrualIfDue,
};
