/** Format seconds as "3min" or "1h 02min" for catalog / curriculum UI */
export function formatLessonDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) return "";
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${String(rem).padStart(2, "0")}min` : `${h}h`;
}

export function sumLessonSeconds(
  sections: { lessons: { durationSec: number | null }[] }[],
): number {
  let t = 0;
  for (const s of sections) {
    for (const l of s.lessons) {
      t += l.durationSec ?? 0;
    }
  }
  return t;
}

export function formatTotalDuration(seconds: number): string {
  if (seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}min total`;
  return `${h}hr ${m}min total`;
}
