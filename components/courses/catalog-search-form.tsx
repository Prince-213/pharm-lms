"use client";

import { Search } from "@/lib/icons/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CatalogSearchForm({
  initialQuery,
  className = "",
}: {
  initialQuery: string;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim().slice(0, 80);
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    router.push(qs ? `/courses?${qs}` : "/courses");
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex w-full items-center gap-2 rounded-full border border-slate-400 bg-slate-50 px-3 py-3",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search courses"
        aria-label="Search courses"
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
    </form>
  );
}
