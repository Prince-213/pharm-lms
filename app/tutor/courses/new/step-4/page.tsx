"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatApiErrorBody } from "@/lib/api-error-message";
import {
  clearMentorNewCourseDraft,
  mergeMentorNewCourseDraft,
  readMentorNewCourseDraft,
} from "@/lib/mentor-new-course-draft";

export default function NewCourseStep4Page() {
  const router = useRouter();
  const options = [
    "I'm very busy right now (0-2 hours)",
    "I'll work on this on the side (2-4 hours)",
    "I have lots of flexibility (5+ hours)",
    "I haven't yet decided if I have time",
  ];
  const [timeChoice, setTimeChoice] = useState(options[2]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCourseAndGoToStudio() {
    setError(null);
    const draft = readMentorNewCourseDraft();
    if (!draft.title || draft.title.length < 3) {
      setError("Add a course title in step 1.");
      return;
    }
    if (!draft.category?.trim()) {
      setError("Choose a category in step 2.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: draft.title.trim(),
          category: draft.category.trim(),
          language: "English",
        }),
      });

      const raw = await response.text();
      let payload: unknown = null;
      if (raw) {
        try {
          payload = JSON.parse(raw) as unknown;
        } catch {
          setError(
            raw.length > 200
              ? `Server error (${response.status}).`
              : raw || `Server error (${response.status}).`,
          );
          return;
        }
      }

      if (!response.ok) {
        setError(formatApiErrorBody(payload));
        return;
      }

      const course = payload as { id?: string };
      if (!course?.id) {
        setError("Course was created but no id was returned. Refresh your courses list.");
        return;
      }

      clearMentorNewCourseDraft();
      router.push(`/tutor/courses/${course.id}/manage/curriculum`);
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "Network error — check your connection or try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <header className="border-b border-[#d1d7dc] bg-white">
        <div className="flex h-10 items-center justify-between px-4 text-xs">
          <span className="text-lg font-bold">PharmLms</span>
          <span>Step 3 of 3</span>
          <Link href="/tutor/courses" className="text-[var(--primary)]">
            Exit
          </Link>
        </div>
        <div className="h-0.5 w-full bg-[var(--primary)]" />
      </header>
      <main className="mx-auto max-w-[640px] px-6 py-16">
        <h1 className="text-center text-4xl font-bold">
          How much time can you spend creating your course per week?
        </h1>
        <p className="mt-3 text-center text-sm text-[#6a6f73]">
          There&apos;s no wrong answer. We can help you achieve your goals even if
          you don&apos;t have much time.
        </p>
        <div className="mt-10 space-y-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setTimeChoice(option);
                mergeMentorNewCourseDraft({ timeCommitment: option });
              }}
              className={`flex w-full items-center gap-3 border px-3 py-3 text-sm ${timeChoice === option ? "border-[var(--primary)]" : "border-[#d1d7dc]"}`}
            >
              <span>{timeChoice === option ? "◉" : "○"}</span>
              {option}
            </button>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-[#6a6f73]">
          New courses are saved as drafts until you submit them for review and they are approved.
        </p>
        {error ? (
          <p className="mt-6 text-center text-sm text-[#b32d0f]" role="alert">
            {error}
          </p>
        ) : null}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-[#d1d7dc] bg-white px-4 py-3">
        <Link
          href="/tutor/courses/new/step-3"
          className="rounded-sm border border-[var(--primary)] px-3 py-1 text-xs text-[var(--primary)]"
        >
          Previous
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() => void createCourseAndGoToStudio()}
          className="rounded-sm bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create course"}
        </button>
      </footer>
    </div>
  );
}
