const {
  LEAVE_SESSIONS,
  fromSessionDayFraction,
  toSessionDayFraction,
  calculateSameDaySessionCharge,
} = require('../constants/leaveSessions');

/**
 * Leave day calculations — working days, sandwich rule, holiday overlap.
 *
 * Sandwich rule (when enabled on leave type):
 * weekends and holidays that fall inside the leave date range are also charged.
 * Chargeable days = workingDays + sandwichDaysApplied, adjusted for from/to sessions.
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

function isChargeableCalendarDay(day, holidaySet, applySandwichRule) {
  const holiday = holidaySet.has(day.toDateString());
  const weekend = isWeekend(day);

  if (!holiday && !weekend) {
    return true;
  }

  return Boolean(applySandwichRule) && (holiday || weekend);
}

/**
 * Apply from/to session fractions on top of working-day + sandwich calculation.
 *
 * From session: FIRST_HALF = full day, SECOND_HALF = half day from afternoon.
 * To session: FIRST_HALF = half day until morning, SECOND_HALF = full day.
 */
function calculateLeaveDaysWithSessions({
  fromDate,
  toDate,
  holidays = [],
  applySandwichRule = false,
  fromSession = LEAVE_SESSIONS.FIRST_HALF,
  toSession = LEAVE_SESSIONS.SECOND_HALF,
}) {
  const leaveDays = calculateLeaveDays({ fromDate, toDate, holidays, applySandwichRule });
  const holidaySet = buildHolidaySet(holidays);
  const from = startOfDay(fromDate);
  const to = startOfDay(toDate);
  const sameDay = from.getTime() === to.getTime();

  if (sameDay) {
    if (!isChargeableCalendarDay(from, holidaySet, applySandwichRule)) {
      return { ...leaveDays, chargeableDays: 0 };
    }

    const sameDayCharge = calculateSameDaySessionCharge(fromSession, toSession);
    return {
      ...leaveDays,
      chargeableDays: sameDayCharge == null ? 0 : Number(sameDayCharge.toFixed(2)),
    };
  }

  let chargeableDays = Number(leaveDays.chargeableDays || 0);

  if (isChargeableCalendarDay(from, holidaySet, applySandwichRule)) {
    chargeableDays -= 1 - fromSessionDayFraction(fromSession);
  }

  if (isChargeableCalendarDay(to, holidaySet, applySandwichRule)) {
    chargeableDays -= 1 - toSessionDayFraction(toSession);
  }

  return {
    ...leaveDays,
    chargeableDays: Number(Math.max(0, chargeableDays).toFixed(2)),
  };
}

/** Excel sheet alias for sandwich / working-day calculation. */
function calculateDays({ fromDate, toDate, holidays = [], applySandwichRule = false, regionId = null }) {
  return calculateLeaveDays({
    fromDate,
    toDate,
    holidays,
    applySandwichRule,
    regionId,
  });
}

module.exports = {
  calculateLeaveDays,
  calculateLeaveDaysWithSessions,
  calculateDays,
  eachDayInclusive,
  buildHolidaySet,
};
