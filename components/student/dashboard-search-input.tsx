"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardSearchInput({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  return (
    <form
      action="/student/dashboard"
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(
          q
            ? `/student/dashboard?q=${encodeURIComponent(q)}`
            : "/student/dashboard",
        );
      }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search my courses"
          className="h-9 w-48 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] pl-7 pr-2 text-xs text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
        />
      </div>
    </form>
  );
}
