/**
 * Leave day calculations — working days, sandwich rule hooks, holiday overlap.
 */
function eachDayInclusive(fromDate, toDate) {
  const days = [];
  const cursor = new Date(fromDate);
  const end = new Date(toDate);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function calculateLeaveDays({ fromDate, toDate, holidays = [], applySandwichRule = false }) {
  const days = eachDayInclusive(fromDate, toDate);
  const holidaySet = new Set(holidays.map((day) => new Date(day).toDateString()));

  const workingDays = days.filter((day) => {
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const isHoliday = holidaySet.has(day.toDateString());
    return !isWeekend && !isHoliday;
  });

  return {
    totalCalendarDays: days.length,
    workingDays: workingDays.length,
    sandwichDaysApplied: applySandwichRule ? 0 : 0,
  };
}

module.exports = {
  calculateLeaveDays,
};
