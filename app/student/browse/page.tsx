import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BrowseSearchForm } from "@/components/student/browse-search-form";
import { CatalogCourseCard } from "@/components/student/catalog-course-card";
import { UserRole } from "@/generated/prisma/enums";
import {
  POPULAR_CATEGORIES,
  searchPublishedCourses,
} from "@/lib/courses/public-catalog";
import { db } from "@/lib/db";

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

  const listItems = await searchPublishedCourses({
    q: query || undefined,
    topic: topic || undefined,
    sort: "new",
    viewerUserId: session.user.id,
  });

  const courses = listItems.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    thumbnailUrl: item.thumbnailUrl,
    priceMinorUnits: item.priceMinorUnits,
    priceCurrency: item.priceCurrency,
    mentor: { fullName: item.mentorName },
    _count: { enrollments: item.learnerCount },
  }));

  const tokens = [query, topic].filter(Boolean);

  const isStudent = session.user.role === UserRole.STUDENT;
  const wishlistRows = isStudent
    ? await db.wishlist.findMany({
        where: { studentId: session.user.id },
        select: { courseId: true },
      })
    : [];
  const wishlistSet = new Set(
    wishlistRows.map((w: { courseId: string }) => w.courseId),
  );

  const resolvedThumbnails = courses.map((c) => c.thumbnailUrl);

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
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
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
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Explore topics
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR_CATEGORIES.map((c) => {
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
            <p className="mt-1 text-sm text-muted-foreground">
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
          <p className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-muted-foreground shadow-[var(--shadow-sm)]">
            {isFiltered
              ? "No courses match your search yet — try a different keyword or clear the filters."
              : "No published courses yet. When admins approve mentor submissions, they will appear here."}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course, i) => (
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
