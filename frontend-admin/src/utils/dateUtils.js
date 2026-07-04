/**
 * Date convention: ISO 8601 in API, DD-MMM-YYYY in UI.
 */

const MONTH_ABBREV = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_INDEX = MONTH_ABBREV.reduce((acc, month, index) => {
  acc[month.toLowerCase()] = index;
  return acc;
}, {});

export const DATE_CONVENTION = {
  api: 'ISO 8601',
  apiDateExample: '2026-07-04',
  ui: 'DD-MMM-YYYY',
  uiExample: '04-Jul-2026',
};

function toUtcDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const trimmed = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (dateOnly) {
    return new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])));
  }

  const displayMatch = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/.exec(trimmed);
  if (displayMatch) {
    const day = Number(displayMatch[1]);
    const month = MONTH_INDEX[displayMatch[2].toLowerCase()];
    const year = Number(displayMatch[3]);
    if (month === undefined) return null;
    return new Date(Date.UTC(year, month, day));
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Display format for UI: DD-MMM-YYYY (e.g. 04-Jul-2026).
 */
export function formatDisplayDate(value) {
  const date = toUtcDate(value);
  if (!date) return '';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = MONTH_ABBREV[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * API date-only format: YYYY-MM-DD.
 */
export function toApiDate(value) {
  const date = toUtcDate(value);
  if (!date) return null;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * API datetime format: full ISO 8601 UTC.
 */
export function toApiDateTime(value) {
  const date = toUtcDate(value);
  if (!date) return null;
  return date.toISOString();
}

/**
 * Value for HTML <input type="date"> (YYYY-MM-DD).
 */
export function toInputDateValue(value) {
  return toApiDate(value) || '';
}

/**
 * Parse display or ISO string into a Date (UTC day).
 */
export function parseDate(value) {
  return toUtcDate(value);
}
