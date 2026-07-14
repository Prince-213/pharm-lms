import { parseSectionDescription } from "@/lib/curriculum";
import {
  buildCourseAiContext,
  type CourseContextLesson,
  type CourseContextResource,
  type CourseContextSection,
} from "@/lib/ai/course-context";
import { enrichResourceForAi } from "@/lib/ai/resource-ingest";
import { db } from "@/lib/db";

export async function loadCourseAiContextForStudent(
  courseId: string,
  sectionIds?: string[],
): Promise<string> {
  const sections = await db.courseSection.findMany({
    where: {
      courseId,
      ...(sectionIds?.length ? { id: { in: sectionIds } } : {}),
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
    orderBy: { position: "asc" },
  });

  const lessons = await db.lesson.findMany({
    where: {
      section: {
        courseId,
        ...(sectionIds?.length ? { id: { in: sectionIds } } : {}),
      },
    },
    select: {
      title: true,
      content: true,
      videoUrl: true,
      section: { select: { title: true, description: true } },
    },
    orderBy: [{ section: { position: "asc" } }, { position: "asc" }],
  });

  const contextSections: CourseContextSection[] = await Promise.all(
    sections.map(async (section) => {
      const parsed = parseSectionDescription(section.description);
      const resources: CourseContextResource[] = await Promise.all(
        parsed.resources.slice(0, 8).map((r) =>
          enrichResourceForAi({
            type: r.type,
            title: r.title,
            url: r.url,
            mimeType: r.mimeType,
          }),
        ),
      );
      return {
        title: section.title,
        description: section.description,
        resources,
      };
    }),
  );

  const contextLessons: CourseContextLesson[] = lessons.map((l) => ({
    title: l.title,
    content: l.content,
    videoUrl: l.videoUrl,
    section: l.section,
  }));

  return buildCourseAiContext({
    lessons: contextLessons,
    sections: contextSections,
  });
}
