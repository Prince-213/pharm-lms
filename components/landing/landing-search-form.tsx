"use client";

import { Search } from "@/lib/icons/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LandingSearchFormProps = {
  placeholder: string;
  className?: string;
  inputClassName?: string;
};

export function LandingSearchForm({
  placeholder,
  className = "",
  inputClassName = "",
}: LandingSearchFormProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim().slice(0, 80);
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
  }

  return (
    <form
      onSubmit={submit}
      className={className}
    >
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        aria-label="Search courses"
      />
    </form>
  );
}
