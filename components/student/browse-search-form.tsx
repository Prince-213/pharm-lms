"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BrowseSearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  return (
    <form
      action="/student/browse"
      className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(
          q ? `/student/browse?q=${encodeURIComponent(q)}` : "/student/browse",
        );
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search courses by title, topic, or instructor"
          className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-bold text-[var(--surface)] transition hover:bg-[var(--ink-mid)]"
      >
        Search
      </button>
      {initialQuery ? (
        <Link
          href="/student/browse"
          className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] sm:self-center"
        >
          Clear
        </Link>
      ) : null}
    </form>
  );
}
