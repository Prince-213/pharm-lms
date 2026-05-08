/**
 * UTC `YYYY-MM-DD` key. We intentionally use UTC so streaks are evaluated
 * consistently regardless of where the student is, matching how badges are
 * awarded server-side.
 */
export function todayDateKey(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Shifts a YYYY-MM-DD date key by a given number of days.
 */
export function shiftDateKey(key: string, deltaDays: number): string {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return "";
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + deltaDays);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
