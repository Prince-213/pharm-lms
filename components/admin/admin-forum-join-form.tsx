"use client";

import { MessagesSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminForumPostAction } from "@/app/admin/messages/actions";

export type AdminForumCourseOption = {
  id: string;
  title: string;
  mentorName: string;
};

export function AdminForumJoinForm({
  courses,
}: {
  courses: AdminForumCourseOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);
    const courseId = String(fd.get("courseId") ?? "");
    const body = String(fd.get("body") ?? "");

    startTransition(async () => {
      const res = await adminForumPostAction({ courseId, body });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setSuccess("Posted to the course’s General discussion thread.");
      e.currentTarget.reset();
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2 text-[var(--foreground)]">
          <MessagesSquare className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)]">
            Join a course forum
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Post as yourself in the course’s <strong>General discussion</strong>{" "}
            thread (same as students and mentors). Use for clarifications,
            moderation, or official updates alongside the instructor.
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-8 text-center text-sm text-muted-foreground">
          No published courses yet. Publish a course before posting here.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="forum-course"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Course
            </label>
            <select
              id="forum-course"
              name="courseId"
              required
              className="h-11 w-full max-w-xl rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} — {c.mentorName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="forum-body"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Post
            </label>
            <textarea
              id="forum-body"
              name="body"
              required
              rows={6}
              maxLength={2000}
              placeholder="Write your forum message…"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-relaxed text-[var(--foreground)] placeholder:text-muted-foreground"
            />
          </div>
          {error ? (
            <p className="text-sm text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm font-medium text-[var(--success)]">
              {success}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--primary)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
            >
              {pending ? "Posting…" : "Post to forum"}
            </button>
            <p className="text-[11px] text-muted-foreground">
              Tip: open the student course Forum tab in another tab to confirm
              formatting after you post.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
