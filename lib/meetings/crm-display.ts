/** Consistent timestamps across meetings CRM surfaces. */
export function formatMeetingCrmDate(d: Date): string {
  return d.toLocaleString();
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
