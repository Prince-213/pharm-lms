"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Grid3X3, List, Search } from "lucide-react";
import { useState } from "react";
import {
  CatalogResultCard,
  toCatalogResultCardView,
} from "@/components/courses/catalog-result-card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">{children}</CardContent>
    </Card>
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
    <section id="courses-catalogue" className="bg-background py-8 lg:py-10">
      <div className="mx-auto w-[96%] max-w-[1600px] px-1 sm:w-[94%] sm:px-2 lg:w-[92%]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-base text-foreground">
            {activeQ ? (
              <>
                Search result for:{" "}
                <span className="font-bold">{activeQ}</span>
              </>
            ) : (
              <span className="font-bold">{resultsLabel}</span>
            )}
            {totalResults > 0 ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({totalResults.toLocaleString()})
              </span>
            ) : null}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select
                value={activeSort}
                onValueChange={(value) => {
                  router.push(
                    buildHref({
                      ...baseParams,
                      sort: value !== "popular" ? value : undefined,
                    }),
                  );
                }}
              >
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popularity</SelectItem>
                  <SelectItem value="new">Newest</SelectItem>
                  <SelectItem value="free">Free first</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ButtonGroup>
              <Button
                variant={activeView === "grid" ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                asChild
              >
                <Link
                  href={buildHref({ ...baseParams, view: undefined })}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant={activeView === "list" ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                asChild
              >
                <Link
                  href={buildHref({ ...baseParams, view: "list" })}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Link>
              </Button>
            </ButtonGroup>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 space-y-4 lg:w-[220px]">
            <FilterCard title="Search">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search courses"
                  className="pr-9"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0.5 top-1/2 h-8 w-8 -translate-y-1/2"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </FilterCard>

            {facets.categories.length > 0 ? (
              <FilterCard title="Category">
                <div className="space-y-0.5">
                  <Button
                    variant="link"
                    className={cn(
                      "h-auto justify-start px-0 py-1 text-sm",
                      !activeCategory
                        ? "font-semibold text-primary"
                        : "text-muted-foreground",
                    )}
                    asChild
                  >
                    <Link
                      href={buildHref({
                        q: activeQ || undefined,
                        level: activeLevel || undefined,
                        price: activePrice || undefined,
                        sort:
                          activeSort !== "popular" ? activeSort : undefined,
                        view: activeView !== "grid" ? activeView : undefined,
                      })}
                    >
                      All categories
                    </Link>
                  </Button>
                  {facets.categories.map((cat) => {
                    const active =
                      activeCategory.toLowerCase() === cat.toLowerCase();
                    return (
                      <Button
                        key={cat}
                        variant="link"
                        className={cn(
                          "h-auto justify-start px-0 py-1 text-sm",
                          active
                            ? "font-semibold text-primary"
                            : "text-muted-foreground",
                        )}
                        asChild
                      >
                        <Link
                          href={buildHref({
                            q: activeQ || undefined,
                            category: cat,
                            level: activeLevel || undefined,
                            price: activePrice || undefined,
                            sort:
                              activeSort !== "popular"
                                ? activeSort
                                : undefined,
                            view:
                              activeView !== "grid" ? activeView : undefined,
                          })}
                        >
                          {cat}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </FilterCard>
            ) : null}

            <FilterCard title="Price">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={activePrice === "free" ? "default" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link
                    href={buildHref({
                      ...baseParams,
                      price: activePrice === "free" ? undefined : "free",
                    })}
                  >
                    Free
                  </Link>
                </Button>
                <Button
                  variant={activePrice === "paid" ? "default" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link
                    href={buildHref({
                      ...baseParams,
                      price: activePrice === "paid" ? undefined : "paid",
                    })}
                  >
                    Paid
                  </Link>
                </Button>
              </div>
            </FilterCard>

            {facets.levels.length > 0 ? (
              <FilterCard title="Level">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  {facets.levels.map((level) => {
                    const active =
                      activeLevel.toLowerCase() === level.toLowerCase();
                    return (
                      <Button
                        key={level}
                        variant={active ? "default" : "outline"}
                        size="sm"
                        asChild
                      >
                        <Link
                          href={buildHref({
                            ...baseParams,
                            level: active ? undefined : level,
                          })}
                        >
                          {level}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </FilterCard>
            ) : null}

            {(activeCategory || activeLevel || activePrice || activeQ) && (
              <Button variant="link" className="w-full text-primary" asChild>
                <Link href="/courses">Clear all filters</Link>
              </Button>
            )}
          </aside>

          <div className="min-w-0 flex-1">
            {courses.length === 0 ? (
              <Card className="border-dashed shadow-none">
                <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-2 px-6 py-16 text-center text-sm text-muted-foreground">
                  <p>No courses match your filters.</p>
                  <Button variant="link" className="text-primary" asChild>
                    <Link href="/courses">Clear filters</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div
                className={cn(
                  "grid gap-5",
                  activeView === "list"
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2 md:gap-6 xl:grid-cols-3",
                )}
              >
                {courses.map((course) => (
                  <CatalogResultCard
                    key={course.id}
                    course={toCatalogResultCardView(course)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 ? (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={buildHref({
                        ...baseParams,
                        page:
                          currentPage > 1
                            ? String(currentPage - 1)
                            : undefined,
                      })}
                      className={
                        currentPage <= 1
                          ? "pointer-events-none opacity-40"
                          : undefined
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href={buildHref({
                            ...baseParams,
                            page: p > 1 ? String(p) : undefined,
                          })}
                          isActive={currentPage === p}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href={buildHref({
                        ...baseParams,
                        page:
                          currentPage < totalPages
                            ? String(currentPage + 1)
                            : undefined,
                      })}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-40"
                          : undefined
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
