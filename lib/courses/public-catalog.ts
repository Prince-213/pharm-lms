import type { Prisma } from "@/generated/prisma/client";
import { CourseStatus } from "@/generated/prisma/enums";
import {
  CATEGORY_CHIPS,
  type CatalogCoursePayload,
  catalogInclude,
} from "@/lib/course-catalog-detail";
import { catalogTotalSeconds } from "@/lib/course-duration";
import { parseSectionDescription } from "@/lib/curriculum";
import type { DisplayCurrency } from "@/lib/currency/types";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";

export const POPULAR_CATEGORIES = [
  "Clinical skills",
  "Community pharmacy",
  "Dosage & calculations",
  "Patient safety",
  "Leadership",
  "Regulatory",
] as const;

export type CatalogSort = "new" | "popular" | "free";

export type SearchPublishedCoursesParams = {
  q?: string;
  category?: string;
  topic?: string;
  level?: string;
  sort?: CatalogSort;
  take?: number;
};

const listInclude = {
  mentor: { select: { fullName: true } },
  _count: { select: { enrollments: true, reviews: true } },
  reviews: { select: { rating: true } },
} as const;

export type PublishedCourseListItem = {
  id: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  mentorName: string;
  learnerCount: number;
  priceMinorUnits: number | null;
  priceCurrency: string;
  ratingAverage: number | null;
  reviewCount: number;
  createdAt: Date;
};

function buildSearchWhere(params: SearchPublishedCoursesParams): Prisma.CourseWhereInput {
  const q = (params.q ?? "").trim().slice(0, 80);
  const category = (params.category ?? params.topic ?? "").trim().slice(0, 80);
  const level = (params.level ?? "").trim().slice(0, 80);

  const and: Prisma.CourseWhereInput[] = [{ status: CourseStatus.PUBLISHED }];

  if (params.sort === "free") {
    and.push({ OR: [{ priceMinorUnits: null }, { priceMinorUnits: 0 }] });
  }

  if (category) {
    and.push({
      OR: [
        { category: { contains: category, mode: "insensitive" } },
        { primaryTopic: { contains: category, mode: "insensitive" } },
      ],
    });
  }

  if (level) {
    and.push({ level: { contains: level, mode: "insensitive" } });
  }

  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { subtitle: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { primaryTopic: { contains: q, mode: "insensitive" } },
        { mentor: { fullName: { contains: q, mode: "insensitive" } } },
      ],
    });
  }

  return { AND: and };
}

function orderByForSort(sort?: CatalogSort): Prisma.CourseOrderByWithRelationInput {
  if (sort === "popular") {
    return { enrollments: { _count: "desc" } };
  }
  return { createdAt: "desc" };
}

function toListItem(
  course: Awaited<
    ReturnType<
      typeof db.course.findMany<{ include: typeof listInclude }>
    >
  >[number],
  thumbnailUrl: string | null,
): PublishedCourseListItem {
  const reviewCount = course.reviews.length;
  const ratingAverage =
    reviewCount > 0
      ? Math.round(
          (course.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10,
        ) / 10
      : null;

  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    thumbnailUrl,
    mentorName: course.mentor.fullName,
    learnerCount: course._count.enrollments,
    priceMinorUnits: course.priceMinorUnits,
    priceCurrency: course.priceCurrency,
    ratingAverage,
    reviewCount,
    createdAt: course.createdAt,
  };
}

export async function searchPublishedCourses(
  params: SearchPublishedCoursesParams = {},
): Promise<PublishedCourseListItem[]> {
  const courses = await db.course.findMany({
    where: buildSearchWhere(params),
    orderBy: orderByForSort(params.sort),
    take: params.take,
    include: listInclude,
  });

  const thumbs = await Promise.all(
    courses.map((c) => resolveMediaUrl(c.thumbnailUrl)),
  );

  return courses.map((c, i) => toListItem(c, thumbs[i] ?? null));
}

export async function getLatestPublishedCourses(
  take = 4,
): Promise<PublishedCourseListItem[]> {
  return searchPublishedCourses({ sort: "new", take });
}

export async function getCatalogFacets(): Promise<{
  categories: string[];
  levels: string[];
}> {
  const rows = await db.course.findMany({
    where: { status: CourseStatus.PUBLISHED },
    select: { category: true, level: true },
  });

  const categories = new Set<string>(POPULAR_CATEGORIES);
  const levels = new Set<string>();

  for (const row of rows) {
    if (row.category?.trim()) categories.add(row.category.trim());
    if (row.level?.trim()) levels.add(row.level.trim());
  }

  return {
    categories: [...categories].sort((a, b) => a.localeCompare(b)),
    levels: [...levels].sort((a, b) => a.localeCompare(b)),
  };
}

export async function loadPublicCourseCatalogDetail(
  courseId: string,
): Promise<CatalogCoursePayload | null> {
  const course = await db.course.findFirst({
    where: { id: courseId, status: CourseStatus.PUBLISHED },
    include: catalogInclude,
  });
  if (!course) return null;

  const [reviewAgg, reviews] = await Promise.all([
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
  const allResources = await Promise.all(
    rawResources.map(async (r) => ({
      ...r,
      href: await resolveMediaUrl(r.url),
    })),
  );

  const displayPriceCurrency: DisplayCurrency =
    (course.priceCurrency?.toUpperCase() === "USD" ? "USD" : "NGN") as DisplayCurrency;

  return {
    course,
    displayPriceMinorUnits: course.priceMinorUnits,
    displayPriceCurrency,
    courseId,
    thumb,
    promoVideoHref,
    enrollment: null,
    wishlistRow: null,
    isStudent: false,
    ratingAverage,
    reviewCount,
    reviews,
    totalSeconds,
    totalLectures,
    totalQuizzes,
    totalAssignments,
    allResources,
    bullets,
    successfulPurchase: null,
  };
}
