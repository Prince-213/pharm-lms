"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search my courses"
          className="h-9 w-48 pl-7 text-xs"
        />
      </div>
    </form>
  );
}
