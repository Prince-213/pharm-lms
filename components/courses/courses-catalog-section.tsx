"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, Grid3X3, List, ChevronLeft, ChevronRight, BookOpen, Clock } from "lucide-react";
import type { PublishedCourseListItem } from "@/lib/courses/public-catalog";
import type { CatalogSort } from "@/lib/courses/public-catalog";
import { useState } from "react";

type Props = {
  courses: PublishedCourseListItem[];
  facets: { categories: string[]; levels: string[] };
  activeQ: string;
  activeCategory: string;
  activeLevel: string;
  activeSort: CatalogSort;
  currentPage: number;
  totalPages: number;
  totalResults: number;
};

function buildHref(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== "new" && v !== "1") q.set(k, v);
  });
  const s = q.toString();
  return `/courses${s ? `?${s}` : ""}`;
}

function FilterGroup({
  title,
  items,
  paramKey,
  activeValue,
  activeQ,
  activeCategory,
  activeLevel,
  activeSort,
  isOpen: defaultOpen = true,
}: {
  title: string;
  items: { label: string; count?: number }[];
  paramKey: string;
  activeValue: string;
  activeQ: string;
  activeCategory: string;
  activeLevel: string;
  activeSort: string;
  isOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#e0e0e0] py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm font-semibold text-[var(--ink-deep)]"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2.5">
          {items.map((item) => {
            const isActive = activeValue.toLowerCase() === item.label.toLowerCase();
            const nextValue = isActive ? "" : item.label;
            const href = buildHref({
              q: activeQ || undefined,
              category: paramKey === "category" ? nextValue : activeCategory || undefined,
              level: paramKey === "level" ? nextValue : activeLevel || undefined,
              sort: paramKey === "sort" ? nextValue : activeSort || undefined,
            });
            return (
              <Link
                key={item.label}
                href={href}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border text-xs transition ${
                      isActive
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[#d0d0d0]"
                    }`}
                  >
                    {isActive && "✓"}
                  </span>
                  <span className="text-sm text-[var(--ink-deep)] group-hover:text-[var(--accent)] transition-colors">
                    {item.label}
                  </span>
                </span>
                {item.count != null && (
                  <span className="text-sm text-[var(--muted-soft)]">({item.count})</span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatPrice(minorUnits: number | null, currency: string): string {
  if (minorUnits == null || minorUnits === 0) return "Free";
  return `$${(minorUnits / 100).toFixed(2)}`;
}

function CatalogCourseCard({ course }: { course: PublishedCourseListItem }) {
  return (
    <article className="flex flex-col rounded-[14px] bg-white p-4">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[10px]">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[var(--accent-soft)] flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-[var(--accent)]" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <h3 className="text-[16px] font-bold leading-[1.4] text-[var(--ink-deep)] line-clamp-2">
          {course.title}
        </h3>
        <p className="shrink-0 text-[16px] font-bold text-[var(--accent)]">
          {formatPrice(course.priceMinorUnits, course.priceCurrency)}
        </p>
      </div>

      <p className="mt-1.5 text-[13px] font-medium text-[var(--muted-soft)]">
        {course.mentorName}
      </p>

      <div className="mt-4 flex overflow-hidden rounded-[10px] bg-[#f5f5f5]">
        <div className="flex flex-1 items-center gap-2.5 px-3 py-3">
          <BookOpen className="h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.5} />
          <div>
            <p className="text-[11px] font-medium text-[var(--muted-soft)]">Learners</p>
            <p className="text-[13px] font-bold text-[var(--ink-deep)]">
              {course.learnerCount > 0 ? `${course.learnerCount}` : "New"}
            </p>
          </div>
        </div>

        <div className="w-px self-stretch bg-[#e0e0e0]" aria-hidden />

        <div className="flex flex-1 items-center gap-2.5 px-3 py-3">
          <Clock className="h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.5} />
          <div>
            <p className="text-[11px] font-medium text-[var(--muted-soft)]">Rating</p>
            <p className="text-[13px] font-bold text-[var(--ink-deep)]">
              {course.ratingAverage != null ? `${course.ratingAverage}★` : "—"}
            </p>
          </div>
        </div>
      </div>

      <Link
        href={`/courses/${course.id}`}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] font-semibold text-[var(--ink-deep)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        View Course
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

export function CoursesCatalogSection({
  courses,
  facets,
  activeQ,
  activeCategory,
  activeLevel,
  activeSort,
  currentPage,
  totalPages,
  totalResults,
}: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(activeQ);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      buildHref({
        q: searchInput.trim() || undefined,
        category: activeCategory || undefined,
        level: activeLevel || undefined,
        sort: activeSort !== "new" ? activeSort : undefined,
      }),
    );
  };

  const resultsPerPage = 12;
  const startResult = totalResults === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  const categoryItems = facets.categories.map((c) => ({ label: c }));
  const levelItems = facets.levels.map((l) => ({ label: l }));
  const sortItems = [
    { label: "new", count: undefined as number | undefined },
    { label: "popular", count: undefined },
    { label: "free", count: undefined },
  ];

  const sortLabel =
    activeSort === "popular" ? "Popular" : activeSort === "free" ? "Free" : "Newest";

  return (
    <section id="courses-catalogue" className="bg-[#f0f0f0] py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Left Sidebar */}
          <aside className="w-full shrink-0 lg:w-64">
            <form onSubmit={handleSearch} className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-[var(--ink-deep)]">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search Courses"
                  className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2.5 pl-4 pr-10 text-sm text-[var(--ink-deep)] placeholder:text-[var(--muted-soft)] outline-none focus:border-[var(--accent)]"
                />
                <button type="submit" aria-label="Search">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-soft)] hover:text-[var(--accent)]" />
                </button>
              </div>
            </form>

            <FilterGroup
              title="Sort"
              items={[
                { label: "Newest" },
                { label: "Popular" },
                { label: "Free" },
              ]}
              paramKey="sort"
              activeValue={activeSort}
              activeQ={activeQ}
              activeCategory={activeCategory}
              activeLevel={activeLevel}
              activeSort={activeSort}
            />

            <FilterGroup
              title="Categories"
              items={categoryItems}
              paramKey="category"
              activeValue={activeCategory}
              activeQ={activeQ}
              activeCategory={activeCategory}
              activeLevel={activeLevel}
              activeSort={activeSort}
            />

            <FilterGroup
              title="Levels"
              items={levelItems}
              paramKey="level"
              activeValue={activeLevel}
              activeQ={activeQ}
              activeCategory={activeCategory}
              activeLevel={activeLevel}
              activeSort={activeSort}
              isOpen={false}
            />

            <div className="mt-5 flex gap-3">
              <Link
                href="/courses"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1a1a2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a3e]"
              >
                Reset
              </Link>
            </div>
          </aside>

          {/* Right Content */}
          <div className="min-w-0 flex-1">
            {/* Top Bar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--muted-soft)]">
                {totalResults === 0
                  ? "No courses found"
                  : `Showing ${startResult}-${endResult} of ${totalResults} results`}
                {activeCategory ? ` in ${activeCategory}` : ""}
              </p>

              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--muted-soft)]">Sort-by:</span>
                <div className="relative">
                  <select
                    value={activeSort}
                    onChange={(e) => {
                      router.push(
                        buildHref({
                          q: activeQ || undefined,
                          category: activeCategory || undefined,
                          level: activeLevel || undefined,
                          sort: e.target.value !== "new" ? e.target.value : undefined,
                        }),
                      );
                    }}
                    className="appearance-none rounded-lg border border-[#e0e0e0] bg-white py-2 pl-3 pr-8 text-sm text-[var(--ink-deep)] outline-none focus:border-[var(--accent)]"
                  >
                    <option value="new">Newest</option>
                    <option value="popular">Popular</option>
                    <option value="free">Free</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-soft)] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Course Grid */}
            {courses.length === 0 ? (
              <div className="rounded-xl bg-white px-6 py-16 text-center text-sm text-[var(--muted-soft)]">
                No courses match your filters.{" "}
                <Link href="/courses" className="font-semibold text-[var(--accent)] hover:underline">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CatalogCourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Link
                  href={buildHref({
                    q: activeQ || undefined,
                    category: activeCategory || undefined,
                    level: activeLevel || undefined,
                    sort: activeSort !== "new" ? activeSort : undefined,
                    page: currentPage > 1 ? String(currentPage - 1) : undefined,
                  })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] bg-white text-[var(--muted-soft)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] ${
                    currentPage <= 1 ? "opacity-40 pointer-events-none" : ""
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildHref({
                      q: activeQ || undefined,
                      category: activeCategory || undefined,
                      level: activeLevel || undefined,
                      sort: activeSort !== "new" ? activeSort : undefined,
                      page: p > 1 ? String(p) : undefined,
                    })}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                      currentPage === p
                        ? "bg-[var(--accent)] text-white"
                        : "border border-[#e0e0e0] bg-white text-[var(--muted-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    }`}
                  >
                    {p}
                  </Link>
                ))}

                <Link
                  href={buildHref({
                    q: activeQ || undefined,
                    category: activeCategory || undefined,
                    level: activeLevel || undefined,
                    sort: activeSort !== "new" ? activeSort : undefined,
                    page: currentPage < totalPages ? String(currentPage + 1) : undefined,
                  })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] bg-white text-[var(--muted-soft)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] ${
                    currentPage >= totalPages ? "opacity-40 pointer-events-none" : ""
                  }`}
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
