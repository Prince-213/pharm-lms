import {
  catalogTotalSeconds,
  type LessonDurationInput,
} from "@/lib/course-duration";

export function formatCertificateHours(
  estimatedDurationMinutes: number | null | undefined,
  sections: { lessons: LessonDurationInput[] }[],
): string {
  const totalSeconds = catalogTotalSeconds(
    { estimatedDurationMinutes: estimatedDurationMinutes ?? null },
    sections,
  );

  const hours = Math.max(1, Math.round(totalSeconds / 3600));
  return hours === 1 ? "1 Hr" : `${hours} Hrs`;
}
