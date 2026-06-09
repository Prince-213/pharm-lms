"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, Grid3X3, List, ChevronLeft, ChevronRight, BookOpen, Clock } from "lucide-react";

type Course = {
  id: string;
  title: string;
  price: string;
  instructor: string;
  lessons: number;
  duration: string;
  image: string;
  href: string;
};

const coursesData: Course[] = [
  {
    id: "1",
    title: "Advanced Python Programming",
    price: "$65.00",
    instructor: "Sarah Johnson",
    lessons: 18,
    duration: "6 Hour 15 Min",
    image: "/assets/featured-courses/course-1.jpg",
    href: "/courses",
  },
  {
    id: "2",
    title: "Web Development Bootcamp",
    price: "$89.00",
    instructor: "Michael Chen",
    lessons: 24,
    duration: "10 Hour 00 Min",
    image: "/assets/featured-courses/course-2.jpg",
    href: "/courses",
  },
  {
    id: "3",
    title: "Digital Marketing Mastery",
    price: "$75.00",
    instructor: "Emma Wilson",
    lessons: 16,
    duration: "5 Hour 45 Min",
    image: "/assets/featured-courses/course-3.jpg",
    href: "/courses",
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    price: "$60.00",
    instructor: "Alex Rivera",
    lessons: 14,
    duration: "4 Hour 20 Min",
    image: "/assets/featured-courses/course-1.jpg",
    href: "/courses",
  },
  {
    id: "5",
    title: "Data Science with Python",
    price: "$95.00",
    instructor: "David Park",
    lessons: 20,
    duration: "8 Hour 30 Min",
    image: "/assets/featured-courses/course-2.jpg",
    href: "/courses",
  },
  {
    id: "6",
    title: "Machine Learning Basics",
    price: "$70.00",
    instructor: "Lisa Thompson",
    lessons: 17,
    duration: "7 Hour 10 Min",
    image: "/assets/featured-courses/course-3.jpg",
    href: "/courses",
  },
];

const filterData = {
  price: [
    { label: "Free", count: 4 },
    { label: "Paid", count: 10 },
  ],
  categories: [
    { label: "Art & Design", count: 1 },
    { label: "Business", count: 3 },
    { label: "Development", count: 2 },
    { label: "Finance", count: 1 },
    { label: "Health & Fitness", count: 4 },
    { label: "Technology", count: 3 },
    { label: "Data Science", count: 2 },
  ],
  tags: [
    { label: "Training", count: 1 },
  ],
  authors: [
    { label: "Cody Fisher", count: 1 },
    { label: "Eleanor Pena", count: 3 },
    { label: "Floyd Miles", count: 2 },
    { label: "Jenny Wilson", count: 1 },
    { label: "Jacob Jones", count: 4 },
    { label: "Kristin Watson", count: 3 },
    { label: "Millar Richard", count: 2 },
  ],
  levels: [
    { label: "All levels", count: 1 },
    { label: "Beginner", count: 3 },
    { label: "Expert", count: 2 },
  ],
};

function FilterGroup({
  title,
  items,
  isOpen: defaultOpen = true,
}: {
  title: string;
  items: { label: string; count: number }[];
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
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2.5">
          {items.map((item) => (
            <label
              key={item.label}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#d0d0d0] text-[var(--emerald)] focus:ring-[var(--emerald)]"
                />
                <span className="text-sm text-[var(--ink-deep)]">{item.label}</span>
              </span>
              <span className="text-sm text-[var(--muted-soft)]">({item.count})</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function CatalogCourseCard({ course }: { course: Course }) {
  return (
    <article className="flex flex-col rounded-[14px] bg-white p-4">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[10px]">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <h3 className="text-[16px] font-bold leading-[1.4] text-[var(--ink-deep)]">
          {course.title}
        </h3>
        <p className="shrink-0 text-[16px] font-bold text-[var(--emerald)]">
          {course.price}
        </p>
      </div>

      <p className="mt-1.5 text-[13px] font-medium text-[var(--muted-soft)]">
        {course.instructor}
      </p>

      <div className="mt-4 flex overflow-hidden rounded-[10px] bg-[#f5f5f5]">
        <div className="flex flex-1 items-center gap-2.5 px-3 py-3">
          <BookOpen className="h-5 w-5 shrink-0 text-[var(--ink-deep)]" strokeWidth={1.5} />
          <div>
            <p className="text-[11px] font-medium text-[var(--muted-soft)]">Lessons</p>
            <p className="text-[13px] font-bold text-[var(--ink-deep)]">
              {course.lessons} Lessons
            </p>
          </div>
        </div>

        <div className="w-px self-stretch bg-[#e0e0e0]" aria-hidden />

        <div className="flex flex-1 items-center gap-2.5 px-3 py-3">
          <Clock className="h-5 w-5 shrink-0 text-[var(--ink-deep)]" strokeWidth={1.5} />
          <div>
            <p className="text-[11px] font-medium text-[var(--muted-soft)]">Duration</p>
            <p className="text-[13px] font-bold text-[var(--ink-deep)]">{course.duration}</p>
          </div>
        </div>
      </div>

      <Link
        href={course.href}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#e0e0e0] bg-white px-4 py-3 text-[14px] font-semibold text-[var(--ink-deep)] transition hover:border-[var(--emerald)] hover:text-[var(--emerald)]"
      >
        View Courses
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

export function CoursesCatalogSection() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const totalResults = 14;
  const resultsPerPage = 6;
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <section id="courses-catalogue" className="bg-[#f0f0f0] py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Left Sidebar */}
          <aside className="w-full shrink-0 lg:w-64">
            {/* Search */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-[var(--ink-deep)]">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Courses"
                  className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2.5 pl-4 pr-10 text-sm text-[var(--ink-deep)] placeholder:text-[var(--muted-soft)] outline-none focus:border-[var(--emerald)]"
                />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-soft)]" />
              </div>
            </div>

            {/* Filters */}
            <FilterGroup title="Price" items={filterData.price} />
            <FilterGroup title="Categories" items={filterData.categories} />
            <FilterGroup title="Tags" items={filterData.tags} isOpen={false} />
            <FilterGroup title="Author" items={filterData.authors} />
            <FilterGroup title="Levels" items={filterData.levels} />

            {/* Action Buttons */}
            <div className="mt-5 flex gap-3">
              <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--emerald)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6B4CE6]">
                Apply
                <span aria-hidden>→</span>
              </button>
              <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1a1a2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a3e]">
                Reset
                <span aria-hidden>→</span>
              </button>
            </div>
          </aside>

          {/* Right Content */}
          <div className="min-w-0 flex-1">
            {/* Top Bar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--muted-soft)]">
                Showing {startResult}-{endResult} of {totalResults} results
              </p>

              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--muted-soft)]">Sort-by:</span>
                <div className="relative">
                  <select className="appearance-none rounded-lg border border-[#e0e0e0] bg-white py-2 pl-3 pr-8 text-sm text-[var(--ink-deep)] outline-none focus:border-[var(--emerald)]">
                    <option>Select</option>
                    <option>Popular</option>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-soft)] pointer-events-none" />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                      viewMode === "grid"
                        ? "bg-[var(--emerald)] text-white"
                        : "bg-white text-[var(--muted-soft)] border border-[#e0e0e0]"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                      viewMode === "list"
                        ? "bg-[var(--emerald)] text-white"
                        : "bg-white text-[var(--muted-soft)] border border-[#e0e0e0]"
                    }`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {coursesData.map((course) => (
                <CatalogCourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] bg-white text-[var(--muted-soft)] transition hover:border-[var(--emerald)] hover:text-[var(--emerald)] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                    currentPage === page
                      ? "bg-[var(--emerald)] text-white"
                      : "border border-[#e0e0e0] bg-white text-[var(--muted-soft)] hover:border-[var(--emerald)] hover:text-[var(--emerald)]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0e0e0] bg-white text-[var(--muted-soft)] transition hover:border-[var(--emerald)] hover:text-[var(--emerald)] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
