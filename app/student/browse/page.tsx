import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BrowseSearchForm } from "@/components/student/browse-search-form";
import { CatalogCourseCard } from "@/components/student/catalog-course-card";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import {
  getStudentPricingContext,
  mapCoursesWithDisplayPrices,
} from "@/lib/currency/student-pricing-context";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";

const EXPLORE_CHIPS = [
  "Clinical skills",
  "Community pharmacy",
  "Dosage & calculations",
  "Patient safety",
  "Leadership",
  "Regulatory",
];

type SearchParams = {
  q?: string;
  topic?: string;
};

export default async function BrowseCoursesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/student/login?callbackUrl=/student/browse");
  }

  const params = (await searchParams) ?? {};
  const rawQuery = (params.q ?? "").trim();
  const rawTopic = (params.topic ?? "").trim();
  const query = rawQuery.slice(0, 80);
  const topic = rawTopic.slice(0, 80);

  const tokens = [query, topic].filter(Boolean);
  const courses = await db.course.findMany({
    where: {
      status: CourseStatus.PUBLISHED,
      ...(tokens.length > 0
        ? {
            AND: tokens.map((t) => ({
              OR: [
                { title: { contains: t, mode: "insensitive" as const } },
                { subtitle: { contains: t, mode: "insensitive" as const } },
                { description: { contains: t, mode: "insensitive" as const } },
                { category: { contains: t, mode: "insensitive" as const } },
                { primaryTopic: { contains: t, mode: "insensitive" as const } },
              ],
            })),
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      mentor: { select: { fullName: true } },
      _count: { select: { enrollments: true } },
    },
  });

  const isStudent = session.user.role === UserRole.STUDENT;
  const wishlistRows = isStudent
    ? await db.wishlist.findMany({
        where: { studentId: session.user.id },
        select: { courseId: true },
      })
    : [];
  const wishlistSet = new Set(wishlistRows.map((w) => w.courseId));

  const { displayCurrency } = await getStudentPricingContext(session.user.id);
  const coursesWithDisplayPrices = await mapCoursesWithDisplayPrices(
    courses,
    displayCurrency,
  );

  const resolvedThumbnails = await Promise.all(
    coursesWithDisplayPrices.map((c) => resolveMediaUrl(c.thumbnailUrl)),
  );

  const firstName =
    session.user.name?.split(" ")[0] ??
    session.user.email?.split("@")[0] ??
    "there";
  const isFiltered = tokens.length > 0;

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        <div className="bg-gradient-to-br from-[var(--primary-soft)] via-[var(--surface)] to-[var(--surface-muted)] px-6 py-10 sm:px-10">
          <p className="text-sm font-semibold text-[var(--primary)]">
            Welcome back, {firstName}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Pick up where you left off
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Browse the published catalog, open any course to read the full
            description, then enroll to add it to{" "}
            <Link
              href="/student/dashboard"
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              My learning
            </Link>{" "}
            and start the player.
          </p>
          <BrowseSearchForm initialQuery={query} />
        </div>
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Explore topics
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXPLORE_CHIPS.map((c) => {
            const active = topic.toLowerCase() === c.toLowerCase();
            return (
              <Link
                key={c}
                href={
                  active
                    ? "/student/browse"
                    : `/student/browse?topic=${encodeURIComponent(c)}`
                }
                className={
                  active
                    ? "rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] shadow-[var(--shadow-sm)]"
                    : "rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]/40"
                }
              >
                {c}
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {isFiltered ? "Search results" : "Recommended for you"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isFiltered
                ? `${courses.length} match${courses.length === 1 ? "" : "es"}${
                    query ? ` for "${query}"` : ""
                  }${topic ? ` in ${topic}` : ""}.`
                : "Published courses you can open and enroll in anytime."}
            </p>
          </div>
          <Link
            href="/student/courses"
            className="text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            See enrolled courses →
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)] shadow-[var(--shadow-sm)]">
            {isFiltered
              ? "No courses match your search yet — try a different keyword or clear the filters."
              : "No published courses yet. When admins approve mentor submissions, they will appear here."}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {coursesWithDisplayPrices.map((course, i) => (
              <li key={course.id}>
                <CatalogCourseCard
                  href={`/student/browse/${course.id}`}
                  badge={i === 0 && !isFiltered ? "Featured" : undefined}
                  course={{
                    id: course.id,
                    title: course.title,
                    subtitle: course.subtitle,
                    thumbnailUrl: resolvedThumbnails[i] ?? null,
                    mentorName: course.mentor.fullName,
                    learnerCount: course._count.enrollments,
                    priceMinorUnits: course.priceMinorUnits,
                    priceCurrency: course.priceCurrency,
                  }}
                  wishlist={
                    isStudent ? { saved: wishlistSet.has(course.id) } : null
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
