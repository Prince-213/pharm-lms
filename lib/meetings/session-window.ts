/** Max assumed session length after `startsAt` for expiry / “still active” UI (ms). Default 1 hour. */
export function meetingSessionMaxMs(): number {
  const raw = process.env.MEETING_SESSION_MAX_MS;
  if (raw && /^\d+$/.test(raw)) return Number.parseInt(raw, 10);
  return 60 * 60 * 1000;
}
