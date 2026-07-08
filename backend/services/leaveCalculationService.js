/**
 * Leave day calculations — working days, sandwich rule, holiday overlap.
 *
 * Sandwich rule (when enabled on leave type):
 * weekends and holidays that fall inside the leave date range are also charged.
 * Chargeable days = workingDays + sandwichDaysApplied.
 */

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function eachDayInclusive(fromDate, toDate) {
  const days = [];
  const cursor = startOfDay(fromDate);
  const end = startOfDay(toDate);

  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function isWeekend(day) {
  const weekday = day.getDay();
  return weekday === 0 || weekday === 6;
}

function buildHolidaySet(holidays = []) {
  return new Set(
    holidays
      .map((entry) => {
        const value = entry?.date ?? entry;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
          return null;
        }
        return startOfDay(parsed).toDateString();
      })
      .filter(Boolean)
  );
}

function calculateLeaveDays({ fromDate, toDate, holidays = [], applySandwichRule = false }) {
  const days = eachDayInclusive(fromDate, toDate);
  const holidaySet = buildHolidaySet(holidays);

  let workingDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;

  days.forEach((day) => {
    const dayKey = day.toDateString();
    const holiday = holidaySet.has(dayKey);
    const weekend = isWeekend(day);

    if (holiday) {
      holidayDays += 1;
      return;
    }

    if (weekend) {
      weekendDays += 1;
      return;
    }

    workingDays += 1;
  });

  // Continuous-range sandwich: intervening weekends/holidays inside the leave span are charged.
  const sandwichDaysApplied = applySandwichRule ? weekendDays + holidayDays : 0;
  const chargeableDays = workingDays + sandwichDaysApplied;

  return {
    totalCalendarDays: days.length,
    workingDays,
    weekendDays,
    holidayDays,
    sandwichDaysApplied,
    chargeableDays,
    applySandwichRule: Boolean(applySandwichRule),
  };
}

module.exports = {
  calculateLeaveDays,
  eachDayInclusive,
  buildHolidaySet,
};
