"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CourseCategoryInput } from "@/components/mentor/course-category-input";
import {
  mergeMentorNewCourseDraft,
  readMentorNewCourseDraft,
} from "@/lib/mentor-new-course-draft";

export default function NewCourseStep3Page() {
  const [category, setCategory] = useState("");

  useEffect(() => {
    const draft = readMentorNewCourseDraft();
    if (draft.category) setCategory(draft.category);
  }, []);

  const canContinue = category.trim().length > 0;

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex h-10 items-center justify-between px-4 text-xs">
          <span className="text-lg font-bold">PharmLms</span>
          <span>Step 2 of 3</span>
          <Link href="/tutor/courses" className="text-[var(--primary)]">
            Exit
          </Link>
        </div>
        <div className="h-0.5 w-2/3 bg-[var(--primary)]" />
      </header>
      <main className="mx-auto max-w-[640px] px-6 py-16">
        <h1 className="text-center text-4xl font-bold">
          What category best fits the knowledge you&apos;ll share?
        </h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Pick a suggestion or enter your own — any subject area is welcome. You
          can change this later in course settings.
        </p>
        <div className="mt-10 space-y-2">
          <label
            htmlFor="new-course-category"
            className="block text-sm font-semibold text-[var(--foreground)]"
          >
            Course category
          </label>
          <CourseCategoryInput
            id="new-course-category"
            value={category}
            onChange={setCategory}
            className="h-12 w-full border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Examples: Business, Web Development, Nursing, or your own niche.
          </p>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <Link
          href="/tutor/courses/new/step-2"
          className="rounded-sm border border-[var(--primary)] px-3 py-1 text-xs text-[var(--primary)]"
        >
          Previous
        </Link>
        <Link
          href="/tutor/courses/new/step-4"
          onClick={() =>
            mergeMentorNewCourseDraft({ category: category.trim() })
          }
          className={`rounded-sm px-3 py-1 text-xs font-semibold text-white ${canContinue ? "bg-[var(--primary)]" : "bg-[#c0c4cc] pointer-events-none"}`}
        >
          Continue
        </Link>
      </footer>
    </div>
  );
}
