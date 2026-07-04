const AppError = require('./AppError');

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

const DATE_CONVENTION = {
  api: 'ISO 8601',
  apiDateExample: '2026-07-04',
  apiDateTimeExample: '2026-07-04T10:30:00.000Z',
  ui: 'DD-MMM-YYYY',
  uiExample: '04-Jul-2026',
  note: 'API accepts and returns ISO 8601; UI displays DD-MMM-YYYY',
};

/**
 * Parse an ISO 8601 date or datetime string into a Date.
 * Accepts: 2026-07-04, 2026-07-04T10:30:00.000Z
 */
function parseIsoDate(value, fieldName = 'date') {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_DATE');
    }
    return value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(`${fieldName} is required and must be ISO 8601`, 400, 'INVALID_DATE');
  }

  const trimmed = value.trim();
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  let date;
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]) - 1;
    const day = Number(dateOnlyMatch[3]);
    date = new Date(Date.UTC(year, month, day));
  } else {
    date = new Date(trimmed);
  }

  if (Number.isNaN(date.getTime())) {
    throw new AppError(
      `Invalid ${fieldName}. Use ISO 8601 (e.g. 2026-07-04 or 2026-07-04T10:30:00.000Z)`,
      400,
      'INVALID_DATE'
    );
  }

  return date;
}

/**
 * Format a Date as ISO 8601 date-only: YYYY-MM-DD (UTC calendar day).
 */
function toIsoDateString(value) {
  const date = value instanceof Date ? value : parseIsoDate(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date as full ISO 8601 datetime (UTC).
 */
function toIsoDateTimeString(value) {
  const date = value instanceof Date ? value : parseIsoDate(value);
  return date.toISOString();
}

/**
 * Format a Date as UI display: DD-MMM-YYYY (e.g. 04-Jul-2026).
 * Uses UTC calendar day for consistency with date-only API values.
 */
function toDisplayDate(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const date = value instanceof Date ? value : parseIsoDate(value);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = MONTH_ABBREV[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Start of UTC day for range queries.
 */
function startOfUtcDay(value) {
  const date = parseIsoDate(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * End of UTC day for range queries (inclusive).
 */
function endOfUtcDay(value) {
  const date = parseIsoDate(value);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
  );
}

module.exports = {
  DATE_CONVENTION,
  MONTH_ABBREV,
  parseIsoDate,
  toIsoDateString,
  toIsoDateTimeString,
  toDisplayDate,
  startOfUtcDay,
  endOfUtcDay,
};
