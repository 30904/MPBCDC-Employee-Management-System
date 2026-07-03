/**
 * Generate and manage EMI schedules for disbursed loans.
 */
function buildEmiSchedule({ loanNo, principal, annualRate, tenureMonths, startDate }) {
  if (!loanNo || !principal || !tenureMonths || !startDate) {
    throw new Error('loanNo, principal, tenureMonths, and startDate are required');
  }

  const monthlyRate = (annualRate || 0) / 12 / 100;
  const emi =
    monthlyRate === 0
      ? principal / tenureMonths
      : (principal * monthlyRate * (1 + monthlyRate) ** tenureMonths) /
        ((1 + monthlyRate) ** tenureMonths - 1);

  const schedule = [];
  let balance = principal;
  const firstDue = new Date(startDate);

  for (let emiNo = 1; emiNo <= tenureMonths; emiNo += 1) {
    const interest = balance * monthlyRate;
    const principalComponent = emi - interest;
    balance = Math.max(0, balance - principalComponent);

    const dueDate = new Date(firstDue);
    dueDate.setMonth(firstDue.getMonth() + emiNo - 1);

    schedule.push({
      loanNo,
      emiNo,
      dueDate,
      emiAmount: Number(emi.toFixed(2)),
      principalComponent: Number(principalComponent.toFixed(2)),
      interestComponent: Number(interest.toFixed(2)),
      outstandingBalance: Number(balance.toFixed(2)),
    });
  }

  return schedule;
}

module.exports = {
  buildEmiSchedule,
};
