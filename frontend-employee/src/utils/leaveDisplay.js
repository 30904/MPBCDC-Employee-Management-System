export function applicationChargeableDays(application) {
  const stored = Number(application?.chargeableDays);
  if (Number.isFinite(stored) && stored > 0) {
    return stored;
  }

  if (application?.isHalfDay) {
    return 0.5;
  }

  return Number(application?.workingDays ?? 0) + Number(application?.sandwichDaysApplied ?? 0);
}

export function formatLeaveSession(session) {
  if (session === 'FIRST_HALF') {
    return 'First Half';
  }

  if (session === 'SECOND_HALF') {
    return 'Second Half';
  }

  return '—';
}
