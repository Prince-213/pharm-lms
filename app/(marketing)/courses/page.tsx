import { Suspense } from "react";
import { AnimatedSection } from "@/components/landing/animated-section";
import { CoursesCatalogSection } from "@/components/courses/courses-catalog-section";
import { MarketingCatalogSkeleton } from "@/components/ui/route-loading-skeleton";
import {
  countPublishedCourses,
  getCatalogFacets,
  searchPublishedCourseCards,
  type CatalogSort,
} from "@/lib/courses/public-catalog";

type SearchParams = {
  q?: string;
  category?: string;
  level?: string;
  price?: string;
  sort?: string;
  view?: string;
  page?: string;
};

function parseSort(raw: string | undefined): CatalogSort {
  if (raw === "new" || raw === "free") return raw;
  return "popular";
}

function parsePrice(raw: string | undefined): "" | "free" | "paid" {
  if (raw === "free" || raw === "paid") return raw;
  return "";
}

function parseView(raw: string | undefined): "grid" | "list" {
  return raw === "list" ? "list" : "grid";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 80);
  const category = (params.category ?? "").trim().slice(0, 80);
  const level = (params.level ?? "").trim().slice(0, 80);
  const price = parsePrice(params.price);
  const sort = parseSort(params.sort);
  const view = parseView(params.view);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const take = 12;
  const skip = (page - 1) * take;

  const searchBase = {
    q: q || undefined,
    category: category || undefined,
    level: level || undefined,
    price: price || undefined,
    sort,
  };

  const [courses, facets, totalResults] = await Promise.all([
    searchPublishedCourseCards({ ...searchBase, take, skip }),
    getCatalogFacets(),
    countPublishedCourses(searchBase),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalResults / take));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Suspense fallback={<MarketingCatalogSkeleton />}>
          <AnimatedSection>
            <CoursesCatalogSection
              courses={courses}
              facets={facets}
              activeQ={q}
              activeCategory={category}
              activeLevel={level}
              activePrice={price}
              activeSort={sort}
              activeView={view}
              currentPage={page}
              totalPages={totalPages}
              totalResults={totalResults}
            />
          </AnimatedSection>
        </Suspense>
      </main>
    </div>
  );
}
