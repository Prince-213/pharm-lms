"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { ChevronDown, Search, X } from "lucide-react";

type SearchResult = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  mentorName: string;
  priceMinorUnits: number | null;
  priceCurrency: string;
};

const categories = [
  "All Categories",
  "Clinical skills",
  "Community pharmacy",
  "Dosage & calculations",
  "Patient safety",
  "Leadership",
  "Regulatory",
];

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const HomeHeroSection = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (q: string, cat: string) => {
    if (!q.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim(), take: "5" });
      if (cat !== "All Categories") {
        params.set("category", cat);
      }
      const res = await fetch(`/api/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.courses ?? []);
        setShowResults(true);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchResults(value, category);
    }, 300);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (query.trim()) {
      fetchResults(query, cat);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "All Categories") params.set("category", category);
    router.push(`/courses${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="gap-y-8 lg:w-[79%] xl:w-[60%] w-[90%] mx-auto py-12 lg:py-[6rem] flex flex-col items-center justify-center px-4">
      <div className="text-base font-medium text-[#5A536C] py-[2px] px-[11px] rounded-lg border border-[var(--border)]">
        <p>100% Quality Courses</p>
      </div>
      <h1 className="text-center font-display text-[30px] font-bold leading-[1.15] text-[var(--ink-deep)] sm:text-[48px] lg:text-[64px]">
        <span className="inline-flex items-center gap-3 flex-wrap justify-center">
          Discover Top
          <span className="relative">
            <img
              src="/assets/online.png"
              alt=""
              className="inline-block h-10 w-auto sm:h-14 lg:h-20 absolute left-0 -z-0"
              aria-hidden="true"
            />
            <p className="z-50 relative text-white">online</p>
          </span>
          <img
            src="/assets/book.png"
            alt=""
            className="inline-block h-10 w-auto sm:h-14 lg:h-20"
            aria-hidden="true"
          />
          <span className="relative inline-block">
            Courses
            <img
              src="/assets/underline.png"
              alt=""
              className="absolute -bottom-5 left-0 w-full h-10 object-contain"
              aria-hidden="true"
            />
          </span>
        </span>
        <br />
        <span className="mt-2 block">& Start Learning Today</span>
      </h1>

      {/* Search Form */}
      <div ref={searchRef} className="relative w-full lg:w-[90%] mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="w-full h-fit flex items-center gap-3 sm:gap-5 justify-between">
            <div className="w-full flex items-center overflow-hidden rounded-[18px] border border-[var(--border)] h-14 sm:h-20 bg-white">
              {/* Category Select */}
              <div className="relative border-r border-[var(--border)] h-full">
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="appearance-none bg-transparent h-full px-3 sm:px-4 pr-7 sm:pr-8 text-xs sm:text-sm font-semibold outline-none cursor-pointer text-[var(--ink-deep)] whitespace-nowrap"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[var(--muted-soft)] pointer-events-none" />
              </div>

              {/* Search Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-[var(--muted-soft)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => {
                    if (results.length > 0) setShowResults(true);
                  }}
                  className="outline-none border-none flex-1 pl-9 pr-3 text-sm placeholder:text-[var(--muted-soft)]"
                  placeholder="Find Courses..."
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      setShowResults(false);
                    }}
                    className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--muted-soft)]/20 text-[var(--muted-soft)] hover:bg-[var(--muted-soft)]/30"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[var(--emerald)] flex items-center justify-center shrink-0 hover:bg-[var(--primary-strong)] transition-colors"
            >
              <MagnifyingGlassIcon className="text-white w-5 h-5 sm:w-7 sm:h-7" />
            </button>
          </div>
        </form>

        {/* Results Popover */}
        {showResults && (
          <div className="absolute left-0 right-0 sm:right-20 top-full mt-2 z-50 max-h-[360px] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-[var(--muted-soft)]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent mr-2" />
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--muted-soft)]">
                No courses found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[360px] py-2">
                {results.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-10 w-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                        <Search className="h-4 w-4 text-[var(--accent)]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--ink-deep)] truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-[var(--muted-soft)]">
                        {course.mentorName}
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-[var(--accent)] shrink-0">
                      {course.priceMinorUnits != null &&
                      course.priceMinorUnits > 0
                        ? `$${(course.priceMinorUnits / 100).toFixed(2)}`
                        : "Free"}
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/courses${query ? `?q=${encodeURIComponent(query.trim())}` : ""}${category !== "All Categories" ? `${query ? "&" : "?"}category=${encodeURIComponent(category)}` : ""}`}
                  onClick={() => setShowResults(false)}
                  className="flex items-center justify-center gap-1 border-t border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--surface-muted)] transition-colors"
                >
                  View all results
                  <span aria-hidden>→</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div className="w-5 h-5 bg-[var(--emerald)] rounded-full flex items-center justify-center shrink-0">
          <CheckIcon className="text-white w-3 h-3" />
        </div>
        <p className="text-xs sm:text-sm font-semibold">
          Industry Leaders Use These Courses to Keep Skills Sharp
        </p>
      </div>
    </div>
  );
};

export default HomeHeroSection;
