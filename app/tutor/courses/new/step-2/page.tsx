"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mergeMentorNewCourseDraft, readMentorNewCourseDraft } from "@/lib/mentor-new-course-draft";

export default function NewCourseStep2Page() {
  const [title, setTitle] = useState("");
  const remaining = useMemo(() => 120 - title.length, [title]);

  useEffect(() => {
    const draft = readMentorNewCourseDraft();
    if (draft.title) setTitle(draft.title);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--surface-muted)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4 text-xs">
          <span className="text-sm font-bold tracking-tight">PharmLms</span>
          <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
            Step 1 of 3
          </span>
          <Link href="/tutor/courses" className="text-[var(--primary)]">
            Exit
          </Link>
        </div>
        <div className="mx-auto h-1 w-full max-w-5xl bg-[var(--border)]">
          <div className="h-1 w-1/3 bg-[var(--primary)]" />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto max-w-xl rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-sm)]">
          <h1 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How about a working title?
          </h1>
          <p className="mt-3 text-center text-sm text-[var(--muted)]">
            It is fine if this is temporary. You can update the course title
            later from the course basics page.
          </p>
          <div className="mt-8">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value.slice(0, 120))}
              placeholder="e.g. Learn Pharmacy Case Studies from Scratch"
              className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            />
            <p className="mt-1 text-right text-xs text-[var(--muted)]">
              {remaining} characters left
            </p>
          </div>
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/tutor/courses"
          className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
        >
          Previous
        </Link>
        <Link
          href="/tutor/courses/new/step-3"
          onClick={() => mergeMentorNewCourseDraft({ title: title.trim() })}
          className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] ${title.trim().length >= 3 ? "bg-[var(--primary)] hover:bg-[var(--primary-strong)]" : "pointer-events-none bg-[var(--muted)]/60"}`}
        >
          Continue
        </Link>
        </div>
      </footer>
    </div>
  );
}
