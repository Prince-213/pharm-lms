"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Search,
} from "lucide-react";
import { useState } from "react";
import {
  FeaturedCourseCard,
  toFeaturedCourseCardView,
} from "@/components/landing/featured-course-card";
import type { PopularCourseCardView } from "@/components/landing/popular-course-card";
import type { CatalogSort } from "@/lib/courses/public-catalog";
import { cn } from "@/lib/utils";

type Props = {
  courses: PopularCourseCardView[];
  facets: { categories: string[]; levels: string[] };
  activeQ: string;
  activeCategory: string;
  activeLevel: string;
  activePrice: string;
  activeSort: CatalogSort;
  activeView: "grid" | "list";
  currentPage: number;
  totalPages: number;
  totalResults: number;
};

function buildHref(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== "popular" && v !== "1" && v !== "grid") q.set(k, v);
  });
  const s = q.toString();
  return `/courses${s ? `?${s}` : ""}`;
}

function FilterCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#e8e8e8] bg-white px-5 py-4",
        className,
      )}
    >
      <h3 className="text-sm font-bold text-[var(--ink-deep)]">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SidebarLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block py-1 text-sm transition-colors",
        active
          ? "font-semibold text-[var(--emerald)]"
          : "text-[var(--muted-soft)] hover:text-[var(--ink-deep)]",
      )}
    >
      {label}
    </Link>
  );
}

function PillButton({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-9 items-center justify-center rounded border text-sm font-medium transition",
        active
          ? "border-[var(--ink-deep)] bg-[var(--ink-deep)] text-white"
          : "border-[#e0e0e0] bg-white text-[var(--ink-deep)] hover:border-[var(--emerald)]",
      )}
    >
      {label}
    </Link>
  );
}


export function CoursesCatalogSection({
  courses,
  facets,
  activeQ,
  activeCategory,
  activeLevel,
  activePrice,
  activeSort,
  activeView,
  currentPage,
  totalPages,
  totalResults,
}: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(activeQ);

  const baseParams = {
    q: activeQ || undefined,
    category: activeCategory || undefined,
    level: activeLevel || undefined,
    price: activePrice || undefined,
    sort: activeSort !== "popular" ? activeSort : undefined,
    view: activeView !== "grid" ? activeView : undefined,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      buildHref({
        q: searchInput.trim() || undefined,
        category: activeCategory || undefined,
        level: activeLevel || undefined,
        price: activePrice || undefined,
        sort: activeSort !== "popular" ? activeSort : undefined,
        view: activeView !== "grid" ? activeView : undefined,
      }),
    );
  };

  const resultsLabel = activeQ
    ? `Search result for: ${activeQ}`
    : activeCategory
      ? `Courses in ${activeCategory}`
      : "All courses";

  return (
    <section id="courses-catalogue" className="bg-[#f4f4f4] py-8 lg:py-10">
      <div className="mx-auto w-[96%] max-w-[1600px] px-1 sm:w-[94%] sm:px-2 lg:w-[92%]">
        {/* Top toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base text-[var(--ink-deep)]">
            {resultsLabel.split(": ").length > 1 ? (
              <>
                Search result for:{" "}
                <span className="font-bold">{activeQ}</span>
              </>
            ) : (
              <span className="font-bold">{resultsLabel}</span>
            )}
            {totalResults > 0 ? (
              <span className="ml-2 text-sm font-normal text-[var(--muted-soft)]">
                ({totalResults.toLocaleString()})
              </span>
            ) : null}
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted-soft)]">Sort by:</span>
              <div className="relative">
                <select
                  value={activeSort}
                  onChange={(e) => {
                    router.push(
                      buildHref({
                        ...baseParams,
                        sort:
                          e.target.value !== "popular"
                            ? e.target.value
                            : undefined,
                      }),
                    );
                  }}
                  className="h-9 min-w-[130px] appearance-none rounded border border-[#e0e0e0] bg-white py-1.5 pl-3 pr-8 text-sm text-[var(--ink-deep)] outline-none focus:border-[var(--emerald)]"
                >
                  <option value="popular">Popularity</option>
                  <option value="new">Newest</option>
                  <option value="free">Free first</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-soft)]" />
              </div>
            </div>

            <div className="flex overflow-hidden rounded border border-[#e0e0e0] bg-white">
              <Link
                href={buildHref({ ...baseParams, view: undefined })}
                aria-label="Grid view"
                className={cn(
                  "flex h-9 w-9 items-center justify-center transition",
                  activeView === "grid"
                    ? "bg-[var(--ink-deep)] text-white"
                    : "text-[var(--muted-soft)] hover:bg-[#f5f5f5]",
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </Link>
              <Link
                href={buildHref({ ...baseParams, view: "list" })}
                aria-label="List view"
                className={cn(
                  "flex h-9 w-9 items-center justify-center border-l border-[#e0e0e0] transition",
                  activeView === "list"
                    ? "bg-[var(--ink-deep)] text-white"
                    : "text-[var(--muted-soft)] hover:bg-[#f5f5f5]",
                )}
              >
                <List className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Sidebar filters */}
          <aside className="w-full shrink-0 space-y-4 lg:w-[220px]">
            <FilterCard title="Search">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search courses"
                    className="w-full rounded border border-[#e0e0e0] py-2 pl-3 pr-9 text-sm outline-none focus:border-[var(--emerald)]"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-soft)]"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </FilterCard>

            {facets.categories.length > 0 ? (
              <FilterCard title="Category">
                <SidebarLink
                  label="All categories"
                  href={buildHref({
                    q: activeQ || undefined,
                    level: activeLevel || undefined,
                    price: activePrice || undefined,
                    sort: activeSort !== "popular" ? activeSort : undefined,
                    view: activeView !== "grid" ? activeView : undefined,
                  })}
                  active={!activeCategory}
                />
                {facets.categories.map((cat) => (
                  <SidebarLink
                    key={cat}
                    label={cat}
                    href={buildHref({
                      q: activeQ || undefined,
                      category: cat,
                      level: activeLevel || undefined,
                      price: activePrice || undefined,
                      sort: activeSort !== "popular" ? activeSort : undefined,
                      view: activeView !== "grid" ? activeView : undefined,
                    })}
                    active={
                      activeCategory.toLowerCase() === cat.toLowerCase()
                    }
                  />
                ))}
              </FilterCard>
            ) : null}

            <FilterCard title="Price">
              <div className="grid grid-cols-2 gap-2">
                <PillButton
                  label="Free"
                  href={buildHref({
                    q: activeQ || undefined,
                    category: activeCategory || undefined,
                    level: activeLevel || undefined,
                    price: activePrice === "free" ? undefined : "free",
                    sort: activeSort !== "popular" ? activeSort : undefined,
                    view: activeView !== "grid" ? activeView : undefined,
                  })}
                  active={activePrice === "free"}
                />
                <PillButton
                  label="Paid"
                  href={buildHref({
                    q: activeQ || undefined,
                    category: activeCategory || undefined,
                    level: activeLevel || undefined,
                    price: activePrice === "paid" ? undefined : "paid",
                    sort: activeSort !== "popular" ? activeSort : undefined,
                    view: activeView !== "grid" ? activeView : undefined,
                  })}
                  active={activePrice === "paid"}
                />
              </div>
            </FilterCard>

            {facets.levels.length > 0 ? (
              <FilterCard title="Level">
                <div className="grid grid-cols-3 gap-2">
                  {facets.levels.map((level) => (
                    <PillButton
                      key={level}
                      label={level}
                      href={buildHref({
                        q: activeQ || undefined,
                        category: activeCategory || undefined,
                        level:
                          activeLevel.toLowerCase() === level.toLowerCase()
                            ? undefined
                            : level,
                        price: activePrice || undefined,
                        sort: activeSort !== "popular" ? activeSort : undefined,
                        view: activeView !== "grid" ? activeView : undefined,
                      })}
                      active={
                        activeLevel.toLowerCase() === level.toLowerCase()
                      }
                    />
                  ))}
                </div>
              </FilterCard>
            ) : null}

            {(activeCategory || activeLevel || activePrice || activeQ) && (
              <Link
                href="/courses"
                className="block text-center text-sm font-semibold text-[var(--emerald)] hover:underline"
              >
                Clear all filters
              </Link>
            )}
          </aside>

          {/* Main results */}
          <div className="min-w-0 flex-1">
            {courses.length === 0 ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-[#d0d0d0] bg-white px-6 py-16 text-center text-sm text-[var(--muted-soft)]">
                No courses match your filters.{" "}
                <Link
                  href="/courses"
                  className="font-semibold text-[var(--emerald)] hover:underline"
                >
                  Clear filters
                </Link>
              </div>
            ) : activeView === "list" ? (
              <div className="grid grid-cols-1 gap-5">
                {courses.map((course) => (
                  <FeaturedCourseCard
                    key={course.id}
                    course={toFeaturedCourseCardView(course)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
                {courses.map((course) => (
                  <FeaturedCourseCard
                    key={course.id}
                    course={toFeaturedCourseCardView(course)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Link
                  href={buildHref({
                    ...baseParams,
                    page: currentPage > 1 ? String(currentPage - 1) : undefined,
                  })}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded border border-[#e0e0e0] bg-white text-[var(--muted-soft)] transition hover:border-[var(--emerald)]",
                    currentPage <= 1 && "pointer-events-none opacity-40",
                  )}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Link
                      key={p}
                      href={buildHref({
                        ...baseParams,
                        page: p > 1 ? String(p) : undefined,
                      })}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded text-sm font-semibold transition",
                        currentPage === p
                          ? "bg-[var(--emerald)] text-white"
                          : "border border-[#e0e0e0] bg-white text-[var(--muted-soft)] hover:border-[var(--emerald)]",
                      )}
                    >
                      {p}
                    </Link>
                  ),
                )}

                <Link
                  href={buildHref({
                    ...baseParams,
                    page:
                      currentPage < totalPages
                        ? String(currentPage + 1)
                        : undefined,
                  })}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded border border-[#e0e0e0] bg-white text-[var(--muted-soft)] transition hover:border-[var(--emerald)]",
                    currentPage >= totalPages && "pointer-events-none opacity-40",
                  )}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
