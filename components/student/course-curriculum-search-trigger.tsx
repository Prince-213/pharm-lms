"use client";

import { Search } from "lucide-react";

export function CourseCurriculumSearchTrigger() {
  return (
    <button
      type="button"
      title="Find in course outline"
      aria-label="Find in course outline"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-transparent text-[var(--muted)] transition hover:border-[#d1d7dc] hover:bg-[#f7f9fa] hover:text-[var(--foreground)]"
      onClick={() => {
        const el = document.getElementById("course-curriculum-filter");
        if (el instanceof HTMLElement) {
          el.focus();
          el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }}
    >
      <Search className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}
