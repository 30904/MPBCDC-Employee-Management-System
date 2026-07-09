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
