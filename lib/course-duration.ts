import { sumLessonSeconds } from "@/lib/lesson-duration";

const ARTICLE_BUMP_SECONDS = 30 * 60;
const ARTICLE_MIN_PLAIN_TEXT = 80;

export function lessonPlainTextLength(html: string | null | undefined): number {
  if (!html) return 0;
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

export type LessonDurationInput = {
  content: string | null;
  videoUrl: string | null;
  durationSec: number | null;
};

export function isArticleLikeLesson(lesson: LessonDurationInput): boolean {
  if (lessonPlainTextLength(lesson.content) < ARTICLE_MIN_PLAIN_TEXT) {
    return false;
  }
  if (lesson.videoUrl?.trim()) {
    return false;
  }
  if ((lesson.durationSec ?? 0) > 0) {
    return false;
  }
  return true;
}

export function courseSectionsHaveArticleLikeLesson(
  sections: { lessons: LessonDurationInput[] }[],
): boolean {
  for (const s of sections) {
    for (const l of s.lessons) {
      if (isArticleLikeLesson(l)) return true;
    }
  }
  return false;
}

export function catalogTotalSeconds(
  course: { estimatedDurationMinutes: number | null },
  sections: { lessons: LessonDurationInput[] }[],
): number {
  const override = course.estimatedDurationMinutes;
  if (override != null && override > 0) {
    return override * 60;
  }
  const videoSum = sumLessonSeconds(sections);
  const bump = courseSectionsHaveArticleLikeLesson(sections)
    ? ARTICLE_BUMP_SECONDS
    : 0;
  return videoSum + bump;
}
