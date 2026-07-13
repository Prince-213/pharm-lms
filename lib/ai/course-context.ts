const MAX_CONTEXT_CHARS = 12000;

function cleanText(input: string) {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateContext(input: string) {
  const cleaned = cleanText(input);
  if (cleaned.length <= MAX_CONTEXT_CHARS) return cleaned;
  return `${cleaned.slice(0, MAX_CONTEXT_CHARS)} ...`;
}

export type CourseContextLesson = {
  title: string;
  content: string | null;
  section: { title: string; description?: string | null };
};

export function buildEnrolledCourseContext(lessons: CourseContextLesson[]): string {
  if (!lessons.length) return "";

  return truncateContext(
    lessons
      .map((lesson) => {
        const sectionBits = [`Section: ${lesson.section.title}`];
        const objectives = lesson.section.description?.trim();
        if (objectives) {
          sectionBits.push(`Section objectives: ${cleanText(objectives)}`);
        }
        sectionBits.push(`Lesson: ${lesson.title}`);
        sectionBits.push(cleanText(lesson.content ?? ""));
        return sectionBits.join("\n");
      })
      .join("\n\n"),
  );
}
