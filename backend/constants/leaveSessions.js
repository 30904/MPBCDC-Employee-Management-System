const LEAVE_SESSIONS = {
  FIRST_HALF: 'FIRST_HALF',
  SECOND_HALF: 'SECOND_HALF',
};

const SESSION_ORDER = {
  [LEAVE_SESSIONS.FIRST_HALF]: 1,
  [LEAVE_SESSIONS.SECOND_HALF]: 2,
};

function normalizeLeaveSession(value, fallback = LEAVE_SESSIONS.FIRST_HALF) {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');

  if (normalized === 'FIRST_HALF' || normalized === 'FH' || normalized === 'FIRSTHALF') {
    return LEAVE_SESSIONS.FIRST_HALF;
  }

  if (normalized === 'SECOND_HALF' || normalized === 'SH' || normalized === 'SECONDHALF') {
    return LEAVE_SESSIONS.SECOND_HALF;
  }

  return fallback;
}

function fromSessionDayFraction(session) {
  return session === LEAVE_SESSIONS.SECOND_HALF ? 0.5 : 1;
}

function toSessionDayFraction(session) {
  return session === LEAVE_SESSIONS.FIRST_HALF ? 0.5 : 1;
}

function usesPartialSessions(fromSession, toSession, sameDay) {
  if (sameDay) {
    return !(fromSession === LEAVE_SESSIONS.FIRST_HALF && toSession === LEAVE_SESSIONS.SECOND_HALF);
  }

  return fromSession === LEAVE_SESSIONS.SECOND_HALF || toSession === LEAVE_SESSIONS.FIRST_HALF;
}

function calculateSameDaySessionCharge(fromSession, toSession) {
  if (SESSION_ORDER[fromSession] > SESSION_ORDER[toSession]) {
    return null;
  }

  if (fromSession === LEAVE_SESSIONS.FIRST_HALF && toSession === LEAVE_SESSIONS.FIRST_HALF) {
    return 0.5;
  }

  if (fromSession === LEAVE_SESSIONS.SECOND_HALF && toSession === LEAVE_SESSIONS.SECOND_HALF) {
    return 0.5;
  }

  return 1;
}

module.exports = {
  LEAVE_SESSIONS,
  SESSION_ORDER,
  normalizeLeaveSession,
  fromSessionDayFraction,
  toSessionDayFraction,
  usesPartialSessions,
  calculateSameDaySessionCharge,
};
