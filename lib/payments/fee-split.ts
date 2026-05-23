export function computeFeeSplit(
  amountMinorUnits: number,
  platformFeePercent: number,
): { platformFeeMinorUnits: number; netToMentorMinorUnits: number } {
  const pct = Math.max(0, Math.min(100, platformFeePercent));
  const platformFeeMinorUnits = Math.floor((amountMinorUnits * pct) / 100);
  const netToMentorMinorUnits = amountMinorUnits - platformFeeMinorUnits;
  return { platformFeeMinorUnits, netToMentorMinorUnits };
}
