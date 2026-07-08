/**
 * Generate and manage EMI schedules for disbursed loans.
 */
const { LOAN_INTEREST_FORMULAS } = require('../constants/loanInterestFormulas');

function round2(value) {
  return Number(Number(value).toFixed(2));
}

function dueDateForEmi(startDate, emiNo) {
  const dueDate = new Date(startDate);
  dueDate.setMonth(dueDate.getMonth() + emiNo - 1);
  return dueDate;
}

function calculateCompoundEmi(principal, annualRate, tenureMonths) {
  const amount = Number(principal);
  const tenure = Number(tenureMonths);
  const annual = Number(annualRate) || 0;

  if (!amount || amount <= 0 || !tenure || tenure <= 0) {
    return 0;
  }

  const monthlyRate = annual / 12 / 100;

  if (monthlyRate === 0) {
    return amount / tenure;
  }

  const factor = (1 + monthlyRate) ** tenure;
  return (amount * monthlyRate * factor) / (factor - 1);
}

function buildCompoundTail({
  loanNo,
  balance,
  annualRate,
  remainingMonths,
  startEmiNo,
  startDate,
}) {
  const monthlyRate = (annualRate || 0) / 12 / 100;
  const emi = calculateCompoundEmi(balance, annualRate, remainingMonths);
  const rows = [];
  let outstanding = balance;

  for (let offset = 0; offset < remainingMonths; offset += 1) {
    const emiNo = startEmiNo + offset;
    const interest = outstanding * monthlyRate;
    const principalComponent = emi - interest;
    outstanding = Math.max(0, outstanding - principalComponent);

    rows.push({
      loanNo,
      emiNo,
      dueDate: dueDateForEmi(startDate, emiNo),
      emiAmount: round2(emi),
      principalComponent: round2(principalComponent),
      interestComponent: round2(interest),
      outstandingBalance: round2(outstanding),
    });
  }

  return rows;
}

function buildSimpleTail({
  loanNo,
  balance,
  principal,
  annualRate,
  tenureMonths,
  remainingMonths,
  startEmiNo,
  startDate,
}) {
  const totalInterest = (principal * annualRate * tenureMonths) / (12 * 100);
  const monthlyInterest = totalInterest / tenureMonths;
  const monthlyPrincipal = balance / remainingMonths;
  const emi = monthlyPrincipal + monthlyInterest;
  let outstanding = balance;
  const rows = [];

  for (let offset = 0; offset < remainingMonths; offset += 1) {
    const emiNo = startEmiNo + offset;
    const principalComponent = monthlyPrincipal;
    outstanding = Math.max(0, outstanding - principalComponent);

    rows.push({
      loanNo,
      emiNo,
      dueDate: dueDateForEmi(startDate, emiNo),
      emiAmount: round2(emi),
      principalComponent: round2(principalComponent),
      interestComponent: round2(monthlyInterest),
      outstandingBalance: round2(outstanding),
    });
  }

  return rows;
}

function buildCompoundSchedule({ loanNo, principal, annualRate, tenureMonths, startDate }) {
  return buildCompoundTail({
    loanNo,
    balance: principal,
    annualRate,
    remainingMonths: tenureMonths,
    startEmiNo: 1,
    startDate,
  });
}

function buildSimpleSchedule({ loanNo, principal, annualRate, tenureMonths, startDate }) {
  return buildSimpleTail({
    loanNo,
    balance: principal,
    principal,
    annualRate,
    tenureMonths,
    remainingMonths: tenureMonths,
    startEmiNo: 1,
    startDate,
  });
}

function buildEmiSchedule({
  loanNo,
  principal,
  annualRate,
  tenureMonths,
  startDate,
  interestFormula = LOAN_INTEREST_FORMULAS.COMPOUND_INTEREST,
}) {
  if (!loanNo || !principal || !tenureMonths || !startDate) {
    throw new Error('loanNo, principal, tenureMonths, and startDate are required');
  }

  if (interestFormula === LOAN_INTEREST_FORMULAS.SIMPLE_INTEREST) {
    return buildSimpleSchedule({ loanNo, principal, annualRate, tenureMonths, startDate });
  }

  return buildCompoundSchedule({ loanNo, principal, annualRate, tenureMonths, startDate });
}

function getOpeningBalance(sortedRows, emiNo, principal) {
  if (emiNo <= 1) {
    return Number(principal);
  }

  const previousRow = sortedRows.find((row) => row.emiNo === emiNo - 1);
  return previousRow ? Number(previousRow.outstandingBalance) : Number(principal);
}

function recalculateScheduleFromEmi({
  existingRows,
  editedEmiNo,
  newEmiAmount,
  principal,
  annualRate,
  tenureMonths,
  startDate,
  interestFormula,
  loanNo,
}) {
  const sortedRows = [...existingRows].sort((left, right) => left.emiNo - right.emiNo);
  const targetRow = sortedRows.find((row) => row.emiNo === editedEmiNo);

  if (!targetRow) {
    throw new Error(`EMI #${editedEmiNo} not found in schedule`);
  }

  if (targetRow.status !== 'Pending') {
    throw new Error('Only pending EMIs can be edited');
  }

  const emiAmount = Number(newEmiAmount);
  if (!Number.isFinite(emiAmount) || emiAmount < 0) {
    throw new Error('emiAmount must be zero or greater');
  }

  const beforeRows = sortedRows.filter((row) => row.emiNo < editedEmiNo);
  const openingBalance = getOpeningBalance(sortedRows, editedEmiNo, principal);
  const monthlyRate = (annualRate || 0) / 12 / 100;

  let interestComponent;
  let principalComponent;

  if (interestFormula === LOAN_INTEREST_FORMULAS.SIMPLE_INTEREST) {
    const totalInterest = (principal * annualRate * tenureMonths) / (12 * 100);
    interestComponent = totalInterest / tenureMonths;
    principalComponent = emiAmount - interestComponent;
  } else {
    interestComponent = openingBalance * monthlyRate;
    principalComponent = emiAmount - interestComponent;
  }

  if (principalComponent > openingBalance + 0.01) {
    throw new Error('EMI amount is too high for the remaining principal balance');
  }

  const outstandingBalance = round2(openingBalance - principalComponent);
  const editedRow = {
    loanNo,
    emiNo: editedEmiNo,
    dueDate: targetRow.dueDate,
    emiAmount: round2(emiAmount),
    principalComponent: round2(principalComponent),
    interestComponent: round2(interestComponent),
    outstandingBalance,
    status: targetRow.status,
    isManuallyAdjusted: true,
  };

  const remainingMonths = tenureMonths - editedEmiNo;
  if (remainingMonths <= 0) {
    return [...beforeRows, editedRow];
  }

  const tailRows =
    interestFormula === LOAN_INTEREST_FORMULAS.SIMPLE_INTEREST
      ? buildSimpleTail({
          loanNo,
          balance: outstandingBalance,
          principal,
          annualRate,
          tenureMonths,
          remainingMonths,
          startEmiNo: editedEmiNo + 1,
          startDate,
        })
      : buildCompoundTail({
          loanNo,
          balance: outstandingBalance,
          annualRate,
          remainingMonths,
          startEmiNo: editedEmiNo + 1,
          startDate,
        });

  const preservedTail = tailRows.map((row) => {
    const existing = sortedRows.find((item) => item.emiNo === row.emiNo);
    return {
      ...row,
      status: existing?.status ?? 'Pending',
      isManuallyAdjusted: false,
    };
  });

  return [...beforeRows, editedRow, ...preservedTail];
}

module.exports = {
  buildEmiSchedule,
  recalculateScheduleFromEmi,
  calculateCompoundEmi,
};
