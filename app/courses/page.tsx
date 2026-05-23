import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { siteConfig } from "@/lib/site-metadata";
import {
  Beaker,
  BookOpen,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
  Stethoscope,
} from "@/lib/icons/server";
import {
  CatalogFilters,
  CatalogFiltersMobile,
} from "@/components/courses/catalog-filters";
import { CatalogSearchForm } from "@/components/courses/catalog-search-form";
import { PublicCourseCard } from "@/components/courses/public-course-card";
import { VerifyCertificateDialog } from "@/components/courses/verify-certificate-dialog";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import {
  getCatalogFacets,
  getLatestPublishedCourses,
  POPULAR_CATEGORIES,
  searchPublishedCourses,
  type CatalogSort,
} from "@/lib/courses/public-catalog";

const CATEGORY_ICONS = [
  FlaskConical,
  Stethoscope,
  Beaker,
  ShieldCheck,
  GraduationCap,
  BookOpen,
] as const;

type SearchParams = {
  q?: string;
  category?: string;
  level?: string;
  sort?: string;
};

function parseSort(raw: string | undefined): CatalogSort {
  if (raw === "popular" || raw === "free") return raw;
  return "new";
}

export const metadata: Metadata = {
  title: "Course catalogue",
  description:
    "Browse published clinical pharmacy courses on PharmLMS. Open any course to view the full curriculum before you enroll.",
  openGraph: {
    title: `Course catalogue · ${siteConfig.name}`,
    description:
      "Browse published clinical pharmacy courses on PharmLMS. Open any course to view the full curriculum before you enroll.",
    url: `${siteConfig.url}/courses`,
  },
};

export default async function PublicCoursesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const q = (params.q ?? "").trim().slice(0, 80);
  const category = (params.category ?? "").trim().slice(0, 80);
  const level = (params.level ?? "").trim().slice(0, 80);
  const sort = parseSort(params.sort);

  const session = await auth();
  const viewerUserId = session?.user?.id;

  const [latest, courses, facets] = await Promise.all([
    getLatestPublishedCourses(4, viewerUserId),
    searchPublishedCourses({
      q: q || undefined,
      category: category || undefined,
      level: level || undefined,
      sort,
      viewerUserId,
    }),
    getCatalogFacets(),
  ]);

  const displayCategories = [
    ...POPULAR_CATEGORIES,
    ...facets.categories.filter(
      (c) =>
        !POPULAR_CATEGORIES.some((p) => p.toLowerCase() === c.toLowerCase()),
    ),
  ].slice(0, 8);

  const isFiltered = Boolean(q || category || level || sort !== "new");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <LandingNavbar audience="student" />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        {/* Page heading */}
        <section className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--emerald)]/80">
            Learn from experts
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[var(--ink-deep)] sm:text-3xl lg:text-4xl">
            Course catalogue
          </h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-slate-500 sm:text-base">
            Browse clinical pharmacy courses on PharmLMS. Open any course to see
            the full curriculum — sign in only when you are ready to enroll.
          </p>
          <VerifyCertificateDialog className="mt-5" />
          <div className="mt-7">
            <Suspense fallback={null}>
              <CatalogSearchForm
                initialQuery={q}
                className="mx-auto w-full max-w-md"
              />
            </Suspense>
          </div>
        </section>

        {/* Popular categories */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Popular category
          </h2>
          {/* Mobile: horizontal scroll — hides on sm and up, switches to grid */}
          <div className="-mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {displayCategories.map((cat, i) => {
              const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
              const active = category.toLowerCase() === cat.toLowerCase();
              const href = active
                ? "/courses"
                : `/courses?category=${encodeURIComponent(cat)}`;

              return (
                <Link
                  key={cat}
                  href={href}
                  className={[
                    "group flex shrink-0 items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-all duration-200",
                    "w-[min(72vw,220px)] sm:w-auto",
                    active
                      ? "border-[var(--emerald)]/60 bg-emerald-50/40 shadow-sm"
                      : "border-slate-200/80 hover:border-slate-300 hover:shadow-sm",
                  ].join(" ")}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 transition-colors group-hover:bg-emerald-50">
                    <Icon
                      className="h-4 w-4 text-slate-500 transition-colors group-hover:text-[var(--emerald)]"
                      strokeWidth={1.5}
                    />
                  </span>
                  <span className="text-sm font-medium text-slate-700 transition-colors group-hover:text-[var(--ink-deep)]">
                    {cat}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Latest released */}
        {latest.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Latest released
            </h2>
            <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {latest.map((course) => (
                <PublicCourseCard
                  key={course.id}
                  course={course}
                  layout="scroll"
                />
              ))}
            </div>
          </section>
        )}

        {/* All courses section */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Browse all classes
          </h2>

          {/* Mobile filter trigger */}
          <div className="mt-4 sm:hidden">
            <Suspense fallback={null}>
              <CatalogFiltersMobile
                categories={facets.categories}
                levels={facets.levels}
                activeCategory={category}
                activeLevel={level}
                activeSort={sort}
              />
            </Suspense>
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
            {/* Desktop sidebar filters */}
            <aside className="hidden w-56 shrink-0 sm:block lg:block">
              <Suspense fallback={null}>
                <CatalogFilters
                  categories={facets.categories}
                  levels={facets.levels}
                  activeCategory={category}
                  activeLevel={level}
                  activeSort={sort}
                />
              </Suspense>
            </aside>

            {/* Course grid */}
            <div className="min-w-0 flex-1">
              <p className="mb-4 text-sm text-slate-500">
                {isFiltered
                  ? `${courses.length} course${courses.length === 1 ? "" : "s"} found${
                      q ? ` for “${q}”` : ""
                    }${category ? ` in ${category}` : ""}.`
                  : `${courses.length} published course${courses.length === 1 ? "" : "s"} available.`}
              </p>

              {courses.length === 0 ? (
                <div className="rounded-xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500">
                  No courses match your filters. Try a different keyword or
                  clear filters.
                  <Link
                    href="/courses"
                    className="mt-3 inline-block font-medium text-[var(--emerald)] underline decoration-1 underline-offset-2"
                  >
                    View all courses
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                  {courses.map((course) => (
                    <PublicCourseCard
                      key={course.id}
                      course={course}
                      layout="grid"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
