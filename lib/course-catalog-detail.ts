import type { SectionResource } from "@/components/mentor/curriculum-editor-v2";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { catalogTotalSeconds } from "@/lib/course-duration";
import { parseSectionDescription } from "@/lib/curriculum";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";

export type CatalogResourceItem = SectionResource & { href: string | null };

export const CATEGORY_CHIPS = [
  "Clinical pharmacy",
  "Community care",
  "Dosage & safety",
  "Patient counseling",
  "Regulatory",
] as const;

const catalogInclude = {
  mentor: { select: { fullName: true, bio: true, avatarUrl: true } },
  sections: {
    orderBy: { position: "asc" as const },
    include: {
      lessons: {
        orderBy: { position: "asc" as const },
        select: {
          id: true,
          title: true,
          durationSec: true,
          content: true,
          videoUrl: true,
        },
      },
      quizzes: {
        select: { id: true, title: true },
      },
    },
  },
  assignments: {
    select: { id: true, title: true, description: true },
  },
  _count: { select: { enrollments: true } },
} as const;

export type CatalogCoursePayload = NonNullable<
  Awaited<ReturnType<typeof loadCourseCatalogDetail>>
>;

/**
 * Loads catalog detail data for /student/browse/[courseId] (published or viewer is mentor).
 */
export async function loadCourseCatalogDetail(
  courseId: string,
  viewer: { id: string; role: UserRole },
) {
  const course = await db.course.findFirst({
    where: {
      id: courseId,
      OR: [{ status: CourseStatus.PUBLISHED }, { mentorId: viewer.id }],
    },
    include: catalogInclude,
  });
  if (!course) return null;

  const isStudent = viewer.role === UserRole.STUDENT;
  const enrollment = isStudent
    ? await db.enrollment.findUnique({
        where: {
          courseId_studentId: { courseId, studentId: viewer.id },
        },
      })
    : null;
  const wishlistRow = isStudent
    ? await db.wishlist.findUnique({
        where: {
          studentId_courseId: { studentId: viewer.id, courseId },
        },
        select: { id: true },
      })
    : null;

  const totalSeconds = catalogTotalSeconds(course, course.sections);
  const totalLectures = course.sections.reduce(
    (n, s) => n + s.lessons.length,
    0,
  );
  const totalQuizzes = course.sections.reduce(
    (n, s) => n + s.quizzes.length,
    0,
  );
  const totalAssignments = course.assignments.length;

  const thumb = await resolveMediaUrl(course.thumbnailUrl);
  const bullets = CATEGORY_CHIPS.slice(0, 4);
  const rawResources = course.sections.flatMap(
    (s) => parseSectionDescription(s.description).resources,
  );
  const allResources: CatalogResourceItem[] = await Promise.all(
    rawResources.map(async (r) => ({
      ...r,
      href: await resolveMediaUrl(r.url),
    })),
  );

  return {
    course,
    courseId,
    thumb,
    enrollment,
    wishlistRow,
    isStudent,
    totalSeconds,
    totalLectures,
    totalQuizzes,
    totalAssignments,
    allResources,
    bullets,
  };
}
