/** Consistent timestamps across meetings CRM surfaces. */
export function formatMeetingCrmDate(d: Date): string {
  return d.toLocaleString();
}

/**
 * Short label for upcoming sessions on dashboards (today / tomorrow / weekday + time).
 */
export function formatMeetingRelativeSchedule(
  startsAt: Date,
  now = new Date(),
): string {
  const start = new Date(startsAt);
  const time = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const todayKey = dayKey(new Date(now));
  const startKey = dayKey(new Date(start));
  if (startKey === todayKey) {
    return `Today · ${time}`;
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (startKey === dayKey(tomorrow)) {
    return `Tomorrow · ${time}`;
  }
  const startMid = new Date(start);
  startMid.setHours(0, 0, 0, 0);
  const nowMid = new Date(now);
  nowMid.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (startMid.getTime() - nowMid.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays >= 2 && diffDays <= 6) {
    const weekday = startsAt.toLocaleDateString(undefined, {
      weekday: "short",
    });
    return `${weekday} · ${time}`;
  }
  return `${startsAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} · ${time}`;
}

export function formatEnrolledCoursesLine(
  courses: { id: string; title: string }[],
): string | null {
  if (!courses.length) return null;
  const sorted = [...courses].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  );
  const maxShow = 2;
  if (sorted.length <= maxShow) {
    return `Enrolled: ${sorted.map((c) => c.title).join(", ")}`;
  }
  const shown = sorted
    .slice(0, maxShow)
    .map((c) => c.title)
    .join(", ");
  return `Enrolled: ${shown} +${sorted.length - maxShow}`;
}

export function enrollmentsByStudentId(
  rows: { studentId: string; course: { id: string; title: string } }[],
): Map<string, { id: string; title: string }[]> {
  const map = new Map<string, Map<string, { id: string; title: string }>>();
  for (const row of rows) {
    let inner = map.get(row.studentId);
    if (!inner) {
      inner = new Map();
      map.set(row.studentId, inner);
    }
    inner.set(row.course.id, { id: row.course.id, title: row.course.title });
  }
  const out = new Map<string, { id: string; title: string }[]>();
  for (const [sid, inner] of map) {
    out.set(sid, [...inner.values()]);
  }
  return out;
}
