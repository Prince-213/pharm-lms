import type { SectionResource } from "@/components/mentor/curriculum-editor-v2";
import { CoursePurchaseStatus, CourseStatus, UserRole } from "@/generated/prisma/enums";
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

export type LoadCourseCatalogOptions = {
  /**
   * When true **and** `viewer.role === ADMIN`, loads the course by id only (any status).
   * Caller must enforce admin auth on the route.
   */
  adminCatalogAccess?: boolean;
};

/**
 * Loads catalog detail data for /student/browse/[courseId] (published or viewer is mentor),
 * or any course for admins when `adminCatalogAccess` is set with an ADMIN viewer.
 */
export async function loadCourseCatalogDetail(
  courseId: string,
  viewer: { id: string; role: UserRole },
  options?: LoadCourseCatalogOptions,
) {
  const useAdminAccess =
    Boolean(options?.adminCatalogAccess) && viewer.role === UserRole.ADMIN;

  const course = await db.course.findFirst({
    where: useAdminAccess
      ? { id: courseId }
      : {
          id: courseId,
          OR: [{ status: CourseStatus.PUBLISHED }, { mentorId: viewer.id }],
        },
    include: catalogInclude,
  });
  if (!course) return null;

  const isStudent = viewer.role === UserRole.STUDENT;
  const [enrollment, wishlistRow, reviewAgg, reviews, successfulPurchase] =
    await Promise.all([
    isStudent
      ? db.enrollment.findUnique({
          where: {
            courseId_studentId: { courseId, studentId: viewer.id },
          },
        })
      : Promise.resolve(null),
    isStudent
      ? db.wishlist.findUnique({
          where: {
            studentId_courseId: { studentId: viewer.id, courseId },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
    db.courseReview.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: true,
    }),
    db.courseReview.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        student: { select: { fullName: true } },
      },
    }),
    isStudent
      ? db.coursePurchase.findFirst({
          where: {
            courseId,
            studentId: viewer.id,
            status: CoursePurchaseStatus.SUCCESS,
          },
          select: { paidAt: true, amountMinorUnits: true },
          orderBy: { paidAt: "desc" },
        })
      : Promise.resolve(null),
  ]);

  const reviewCount = reviewAgg._count;
  const ratingAverage =
    reviewCount > 0 && reviewAgg._avg.rating != null
      ? Math.round(reviewAgg._avg.rating * 10) / 10
      : null;

  const totalLectures = course.sections.reduce(
    (n, s) => n + s.lessons.length,
    0,
  );
  const totalQuizzes = course.sections.reduce(
    (n, s) => n + s.quizzes.length,
    0,
  );
  const totalAssignments = course.assignments.length;

  let totalSeconds = catalogTotalSeconds(course, course.sections);
  const hasBlueprintContent =
    totalLectures + totalQuizzes + totalAssignments > 0;
  if (totalSeconds <= 0 && hasBlueprintContent) {
    totalSeconds = 30 * 60;
  }

  const thumb = await resolveMediaUrl(course.thumbnailUrl);
  const promoVideoHref = await resolveMediaUrl(course.promoVideoUrl);
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
    promoVideoHref,
    enrollment,
    wishlistRow,
    isStudent,
    ratingAverage,
    reviewCount,
    reviews,
    totalSeconds,
    totalLectures,
    totalQuizzes,
    totalAssignments,
    allResources,
    bullets,
    successfulPurchase,
  };
}
