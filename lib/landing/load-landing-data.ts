import type { PopularCourseCardView } from "@/components/landing/popular-course-card";
import {
  BlogPostStatus,
  CourseStatus,
  MentorProfileStatus,
  UserRole,
} from "@/generated/prisma/enums";
import { parseBlogTags } from "@/lib/blog/parse-tags";
import type { LandingBlogPostView } from "@/lib/blog/types";
import { catalogTotalSeconds } from "@/lib/course-duration";
import {
  getStudentPricingContext,
  mapCoursesWithDisplayPrices,
} from "@/lib/currency/student-pricing-context";
import { db } from "@/lib/db";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { formatTotalDuration } from "@/lib/lesson-duration";
import { resolveMediaUrl } from "@/lib/media-url";

const DEFAULT_COURSE_IMAGE =
  "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=800";
const DEFAULT_AVATAR = "/assets/tutor.png";

export type LandingPersonView = {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  href: string;
};

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages.length ? pages : [[]];
}

function stripHtml(html: string, maxLen = 140): string {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1)}…`;
}

function formatBlogDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Logs a database failure without crashing the landing page. Used to keep
 * marketing routes renderable when Neon is asleep / unreachable.
 */
function warnLandingDbFailure(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[landing] ${scope} failed; rendering fallback:`, message);
}

export async function loadLandingPopularCoursePages(
  viewerUserId?: string,
  pageSize = 3,
  take = 9,
): Promise<PopularCourseCardView[][]> {
  try {
    const courses = await db.course.findMany({
      where: { status: CourseStatus.PUBLISHED },
      orderBy: { enrollments: { _count: "desc" } },
      take,
      include: {
        mentor: { select: { fullName: true, avatarUrl: true } },
        _count: { select: { enrollments: true, reviews: true } },
        reviews: { select: { rating: true } },
        sections: {
          select: {
            lessons: { select: { durationSec: true, content: true, videoUrl: true } },
          },
        },
      },
    });

    if (!courses.length) return [[]];

    const { displayCurrency } = await getStudentPricingContext(viewerUserId);

    const priced = await mapCoursesWithDisplayPrices(
      courses.map((c) => ({
        id: c.id,
        priceMinorUnits: c.priceMinorUnits,
      })),
      displayCurrency,
    );
    const priceById = new Map(priced.map((p) => [p.id, p]));

    const cards = await Promise.all(
      courses.map(async (course) => {
        const pricedRow = priceById.get(course.id);
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
          priceLabel: formatMinorUnitsToCurrency(
            pricedRow?.priceMinorUnits ?? course.priceMinorUnits,
            pricedRow?.priceCurrency ?? displayCurrency,
            { zeroAsFree: true },
          ),
        } satisfies PopularCourseCardView;
      }),
    );

    return chunk(cards, pageSize);
  } catch (error) {
    warnLandingDbFailure("loadLandingPopularCoursePages", error);
    return [[]];
  }
}

async function loadLandingPeople(
  role: typeof UserRole.TUTOR | typeof UserRole.MENTOR,
  hrefPrefix: string,
  take = 4,
): Promise<LandingPersonView[]> {
  const where =
    role === UserRole.MENTOR
      ? {
          role: UserRole.MENTOR,
          isActive: true,
          mentorProfileStatus: MentorProfileStatus.APPROVED,
        }
      : {
          role: UserRole.TUTOR,
          isActive: true,
        };

  try {
    const people = await db.user.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take,
      select: {
        id: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        mentorHeadline: true,
        mentorSpecialties: true,
        courses: {
          where: { status: CourseStatus.PUBLISHED },
          select: { id: true },
          take: 1,
        },
      },
    });

    return Promise.all(
      people.map(async (person) => {
        const avatar =
          (await resolveMediaUrl(person.avatarUrl)) ?? DEFAULT_AVATAR;
        const title =
          person.mentorHeadline?.trim() ||
          (role === UserRole.TUTOR
            ? person.courses.length
              ? "Course instructor"
              : "Pharmacy tutor"
            : "Pharmacy mentor");
        const bio =
          person.bio?.trim() ||
          person.mentorSpecialties?.trim() ||
          (role === UserRole.TUTOR
            ? "Teaches clinical pharmacy courses on PharmLMS."
            : "Offers 1-on-1 mentoring on PharmLMS.");

        return {
          id: person.id,
          name: person.fullName,
          title,
          bio,
          avatar,
          href: `${hrefPrefix}/${person.id}`,
        };
      }),
    );
  } catch (error) {
    warnLandingDbFailure(`loadLandingPeople(${role})`, error);
    return [];
  }
}

export function loadLandingTutors(take = 4) {
  return loadLandingPeople(UserRole.TUTOR, "/student/tutors", take);
}

export function loadLandingMentors(take = 4) {
  return loadLandingPeople(UserRole.MENTOR, "/student/mentors", take);
}

export async function loadLandingBlogPosts(
  take = 4,
): Promise<LandingBlogPostView[]> {
  try {
    const posts = await db.blogPost.findMany({
      where: { status: BlogPostStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take,
    });

    return Promise.all(
      posts.map(async (post) => {
        const image =
          (await resolveMediaUrl(post.coverImageUrl)) ??
          "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=800";
        const published = post.publishedAt ?? post.createdAt;

        return {
          slug: post.slug,
          href: `/blog/${post.slug}`,
          image,
          imageAlt: post.title,
          date: formatBlogDate(published),
          title: post.featuredImageOnly ? "" : post.title,
          excerpt: post.featuredImageOnly ? "" : post.excerpt,
          tags: parseBlogTags(post.tags),
          featured: post.featured,
          featuredImageOnly: post.featuredImageOnly,
        };
      }),
    );
  } catch (error) {
    warnLandingDbFailure("loadLandingBlogPosts", error);
    return [];
  }
}

export async function loadBlogPostBySlug(slug: string) {
  try {
    const post = await db.blogPost.findFirst({
      where: { slug, status: BlogPostStatus.PUBLISHED },
    });
    if (!post) return null;

    const coverImage =
      (await resolveMediaUrl(post.coverImageUrl)) ?? DEFAULT_COURSE_IMAGE;
    const published = post.publishedAt ?? post.createdAt;

    return {
      ...post,
      coverImage,
      tags: parseBlogTags(post.tags),
      formattedDate: formatBlogDate(published),
    };
  } catch (error) {
    warnLandingDbFailure(`loadBlogPostBySlug(${slug})`, error);
    return null;
  }
}
