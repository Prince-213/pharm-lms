import type { Prisma } from "@/generated/prisma/client";
import { CourseStatus } from "@/generated/prisma/enums";
import {
  CATEGORY_CHIPS,
  type CatalogCoursePayload,
  catalogInclude,
} from "@/lib/course-catalog-detail";
import { catalogTotalSeconds } from "@/lib/course-duration";
import { parseSectionDescription } from "@/lib/curriculum";
import {
  getStudentPricingContext,
  mapCoursesWithDisplayPrices,
  toDisplayCoursePrice,
} from "@/lib/currency/student-pricing-context";
import type { DisplayCurrency } from "@/lib/currency/types";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { formatTotalDuration } from "@/lib/lesson-duration";
import type { PopularCourseCardView } from "@/components/landing/popular-course-card";

const DEFAULT_COURSE_IMAGE =
  "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=800";
const DEFAULT_AVATAR = "/assets/tutor.png";

function stripHtml(html: string, maxLen = 140): string {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1)}…`;
}

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
  price?: "free" | "paid";
  sort?: CatalogSort;
  take?: number;
  skip?: number;
  /** When set, profile country can override geo for display currency. */
  viewerUserId?: string;
};

const listInclude = {
  mentor: { select: { fullName: true, avatarUrl: true } },
  _count: { select: { enrollments: true, reviews: true } },
  reviews: { select: { rating: true } },
  sections: {
    select: {
      lessons: { select: { durationSec: true, content: true, videoUrl: true } },
    },
  },
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

  if (params.price === "free") {
    and.push({ OR: [{ priceMinorUnits: null }, { priceMinorUnits: 0 }] });
  }

  if (params.price === "paid") {
    and.push({ priceMinorUnits: { gt: 0 } });
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
    skip: params.skip,
    include: listInclude,
  });

  const thumbs = await Promise.all(
    courses.map((c) => resolveMediaUrl(c.thumbnailUrl)),
  );

  const items = courses.map((c, i) => toListItem(c, thumbs[i] ?? null));
  const { displayCurrency } = await getStudentPricingContext(
    params.viewerUserId,
  );
  return mapCoursesWithDisplayPrices(items, displayCurrency);
}

export async function countPublishedCourses(
  params: SearchPublishedCoursesParams = {},
): Promise<number> {
  return db.course.count({ where: buildSearchWhere(params) });
}

type CourseListRow = Awaited<
  ReturnType<typeof db.course.findMany<{ include: typeof listInclude }>>
>[number];

export async function mapCoursesToPopularCardViews(
  courses: CourseListRow[],
  pricedItems: PublishedCourseListItem[],
): Promise<PopularCourseCardView[]> {
  const priceById = new Map(pricedItems.map((p) => [p.id, p]));

  return Promise.all(
    courses.map(async (course) => {
      const priced = priceById.get(course.id);
      let totalSeconds = catalogTotalSeconds(course, course.sections);
      const lessonCount = course.sections.reduce(
        (n, s) => n + s.lessons.length,
        0,
      );
      if (totalSeconds <= 0 && lessonCount > 0) totalSeconds = 30 * 60;

      const [thumb, mentorAvatar] = await Promise.all([
        resolveMediaUrl(course.thumbnailUrl),
        resolveMediaUrl(course.mentor.avatarUrl),
      ]);

      const reviewCount = course.reviews.length;
      const rating =
        reviewCount > 0
          ? course.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
          : 0;

      return {
        id: course.id,
        href: `/courses/${course.id}`,
        image: thumb ?? DEFAULT_COURSE_IMAGE,
        imageAlt: course.title,
        category:
          course.category?.trim() ||
          course.primaryTopic?.trim() ||
          "Pharmacy",
        title: course.title,
        description:
          course.subtitle?.trim() ||
          stripHtml(course.description) ||
          "Explore this published course on PharmLMS.",
        rating,
        reviewCount,
        instructor: {
          name: course.mentor.fullName,
          avatar: mentorAvatar ?? DEFAULT_AVATAR,
          enrolled: course._count.enrollments,
        },
        duration: formatTotalDuration(totalSeconds).replace(" total", ""),
        lessonCount,
        priceLabel: formatMinorUnitsToCurrency(
          priced?.priceMinorUnits ?? course.priceMinorUnits,
          priced?.priceCurrency ?? course.priceCurrency,
          { zeroAsFree: true },
        ),
      } satisfies PopularCourseCardView;
    }),
  );
}

export async function searchPublishedCourseCards(
  params: SearchPublishedCoursesParams = {},
): Promise<PopularCourseCardView[]> {
  const courses = await db.course.findMany({
    where: buildSearchWhere(params),
    orderBy: orderByForSort(params.sort),
    take: params.take,
    skip: params.skip,
    include: listInclude,
  });

  const thumbs = await Promise.all(
    courses.map((c) => resolveMediaUrl(c.thumbnailUrl)),
  );
  const items = courses.map((c, i) => toListItem(c, thumbs[i] ?? null));
  const { displayCurrency } = await getStudentPricingContext(
    params.viewerUserId,
  );
  const priced = await mapCoursesWithDisplayPrices(items, displayCurrency);

  return mapCoursesToPopularCardViews(courses, priced);
}

export async function getLatestPublishedCourses(
  take = 4,
  viewerUserId?: string,
): Promise<PublishedCourseListItem[]> {
  return searchPublishedCourses({ sort: "new", take, viewerUserId });
}

export async function getCatalogFacets(): Promise<{
  categories: string[];
  levels: string[];
}> {
  const rows = await db.course.findMany({
    where: { status: CourseStatus.PUBLISHED },
    select: { category: true, level: true },
  });

  const categories = new Set<string>();
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
  viewerUserId?: string,
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

  const { displayCurrency } = await getStudentPricingContext(viewerUserId);
  const display = await toDisplayCoursePrice(
    course.priceMinorUnits,
    displayCurrency,
  );

  return {
    course,
    displayPriceMinorUnits: display.priceMinorUnits,
    displayPriceCurrency: display.priceCurrency as DisplayCurrency,
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
