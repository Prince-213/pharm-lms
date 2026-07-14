import { parseSectionDescription } from "@/lib/curriculum";

const MAX_CONTEXT_CHARS = 12000;
const MAX_LINK_SNIPPET = 1500;
const MAX_RESOURCE_BODY = 2000;

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
  videoUrl?: string | null;
  transcript?: string | null;
  section: { title: string; description?: string | null };
};

export type CourseContextResource = {
  type: "FILE" | "LINK";
  title: string;
  url: string;
  bodyText?: string | null;
};

export type CourseContextSection = {
  title: string;
  description?: string | null;
  resources?: CourseContextResource[];
};

function sectionOverviewText(description: string | null | undefined): string {
  if (!description?.trim()) return "";
  const parsed = parseSectionDescription(description);
  return parsed.text.trim();
}

function appendResources(
  parts: string[],
  resources: CourseContextResource[] | undefined,
) {
  if (!resources?.length) return;
  for (const res of resources) {
    if (res.type === "LINK") {
      parts.push(`Resource link (${res.title}): ${res.url}`);
      if (res.bodyText?.trim()) {
        parts.push(cleanText(res.bodyText).slice(0, MAX_LINK_SNIPPET));
      }
    } else if (res.bodyText?.trim()) {
      parts.push(
        `Resource document (${res.title}): ${cleanText(res.bodyText).slice(0, MAX_RESOURCE_BODY)}`,
      );
    }
  }
}

/** Legacy builder — parses section description correctly (no raw JSON). */
export function buildEnrolledCourseContext(
  lessons: CourseContextLesson[],
): string {
  if (!lessons.length) return "";

  return truncateContext(
    lessons
      .map((lesson) => {
        const sectionBits = [`Section: ${lesson.section.title}`];
        const overview = sectionOverviewText(lesson.section.description);
        if (overview) {
          sectionBits.push(`Section overview: ${cleanText(overview)}`);
        }
        sectionBits.push(`Lesson: ${lesson.title}`);
        const body = cleanText(lesson.content ?? "");
        if (body) {
          sectionBits.push(body);
        } else if (lesson.transcript?.trim()) {
          sectionBits.push(cleanText(lesson.transcript));
        } else if (lesson.videoUrl) {
          sectionBits.push(
            `(Video lesson "${lesson.title}" — study concepts from section overview and related resources.)`,
          );
        }
        return sectionBits.join("\n");
      })
      .join("\n\n"),
  );
}

/** Richer context: lessons + parsed section text + optional resource bodies. */
export function buildCourseAiContext(input: {
  lessons: CourseContextLesson[];
  sections?: CourseContextSection[];
}): string {
  const { lessons, sections = [] } = input;
  if (!lessons.length && !sections.length) return "";

  const parts: string[] = [];

  for (const section of sections) {
    parts.push(`Section: ${section.title}`);
    const overview = sectionOverviewText(section.description);
    if (overview) {
      parts.push(`Section overview: ${cleanText(overview)}`);
    }
    appendResources(parts, section.resources);
  }

  for (const lesson of lessons) {
    parts.push(`Lesson: ${lesson.title}`);
    const body = cleanText(lesson.content ?? "");
    if (body) {
      parts.push(body);
    } else if (lesson.transcript?.trim()) {
      parts.push(cleanText(lesson.transcript));
    }
  }

  return truncateContext(parts.join("\n\n"));
}

export { cleanText, truncateContext };
