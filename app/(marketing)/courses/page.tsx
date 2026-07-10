import { Suspense } from "react";
import { AnimatedSection } from "@/components/landing/animated-section";
import { CoursesCatalogSection } from "@/components/courses/courses-catalog-section";
import {
  getCatalogFacets,
  searchPublishedCourses,
  type CatalogSort,
} from "@/lib/courses/public-catalog";

type SearchParams = {
  q?: string;
  category?: string;
  level?: string;
  sort?: string;
  page?: string;
};

function parseSort(raw: string | undefined): CatalogSort {
  if (raw === "popular" || raw === "free") return raw;
  return "new";
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
  const sort = parseSort(params.sort);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const take = 12;
  const skip = (page - 1) * take;

  const [courses, facets] = await Promise.all([
    searchPublishedCourses({
      q: q || undefined,
      category: category || undefined,
      level: level || undefined,
      sort,
      take,
    }),
    getCatalogFacets(),
  ]);

  const totalResults = courses.length;
  const totalPages = Math.ceil(totalResults / take);
  const pagedCourses = courses.slice(0, take);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main>
        <Suspense fallback={null}>
          <AnimatedSection>
            <CoursesCatalogSection
              courses={pagedCourses}
              facets={facets}
              activeQ={q}
              activeCategory={category}
              activeLevel={level}
              activeSort={sort}
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
