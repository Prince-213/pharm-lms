/** MentorAvailability.dayOfWeek: 0 = Monday … 6 = Sunday */
export const MENTOR_DAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export function mondayZeroFromDate(d: Date): number {
  return (d.getDay() + 6) % 7;
}

function parseHm(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(":").map((x) => Number.parseInt(x, 10));
  return { h: h || 0, m: Number.isFinite(m) ? m : 0 };
}

function minutesOfDay(hm: string): number {
  const { h, m } = parseHm(hm);
  return h * 60 + m;
}

/** Typical consultation length for UI (capped at 45m, at least 30m if the window allows). */
export function consultationBlockMinutes(
  availability: { startTime: string; endTime: string }[],
): number {
  if (!availability.length) return 45;
  const span =
    minutesOfDay(availability[0].endTime) -
    minutesOfDay(availability[0].startTime);
  if (span <= 0) return 45;
  return Math.min(45, Math.max(30, span));
}

export function formatNextOpeningLabel(
  availability: { dayOfWeek: number; startTime: string }[],
): string {
  if (!availability.length) return "When mentor adds hours";
  const allowed = new Set(availability.map((a) => a.dayOfWeek));
  const now = new Date();
  for (let i = 0; i < 28; i++) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const dow = mondayZeroFromDate(d);
    if (!allowed.has(dow)) continue;
    const row = availability.find((a) => a.dayOfWeek === dow);
    if (!row) continue;
    const { h, m } = parseHm(row.startTime);
    const candidate = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      h,
      m,
      0,
      0,
    );
    if (candidate.getTime() <= now.getTime()) continue;
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    const timeStr = candidate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    if (isToday) return `Today, ${timeStr}`;
    const dayStr = candidate.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return `${dayStr} · ${timeStr}`;
  }
  return "See available days below";
}
