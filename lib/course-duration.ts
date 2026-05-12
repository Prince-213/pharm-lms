import { sumLessonSeconds } from "@/lib/lesson-duration";

const ARTICLE_BUMP_SECONDS = 30 * 60;
const ARTICLE_MIN_PLAIN_TEXT = 80;
/** If we have no summed seconds, still treat thin text as "has material" for a minimum duration hint. */
const MIN_TEXT_FOR_DURATION_HINT = 20;

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

/**
 * True when the curriculum likely has learnable material but we cannot sum
 * `durationSec` (e.g. hosted video without parsed length, or short HTML text).
 */
export function courseSectionsNeedDurationFallback(
  sections: { lessons: LessonDurationInput[] }[],
): boolean {
  for (const s of sections) {
    for (const l of s.lessons) {
      const hasVideoWithoutLength =
        Boolean(l.videoUrl?.trim()) &&
        (l.durationSec == null || l.durationSec <= 0);
      if (hasVideoWithoutLength) {
        return true;
      }
      if (lessonPlainTextLength(l.content) >= MIN_TEXT_FOR_DURATION_HINT) {
        return true;
      }
    }
  }
  return false;
}

/** Video `durationSec` sum plus flat article bump when any article-like lesson exists (no mentor override). */
export function derivedDurationSecondsFromSections(
  sections: { lessons: LessonDurationInput[] }[],
): number {
  const videoSum = sumLessonSeconds(sections);
  const bump = courseSectionsHaveArticleLikeLesson(sections)
    ? ARTICLE_BUMP_SECONDS
    : 0;
  let total = videoSum + bump;
  if (total <= 0 && courseSectionsNeedDurationFallback(sections)) {
    total = ARTICLE_BUMP_SECONDS;
  }
  return total;
}

export function catalogTotalSeconds(
  course: { estimatedDurationMinutes: number | null },
  sections: { lessons: LessonDurationInput[] }[],
): number {
  const override = course.estimatedDurationMinutes;
  if (override != null && override > 0) {
    return override * 60;
  }
  return derivedDurationSecondsFromSections(sections);
}
