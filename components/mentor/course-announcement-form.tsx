"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { broadcastToCourseAction } from "@/app/actions/chat";

export function CourseAnnouncementForm({
  courses,
}: {
  courses: Array<{ id: string; title: string; learners: number }>;
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !body.trim()) return;
    setError(null);
    setFeedback(null);
    startTransition(async () => {
      const result = await broadcastToCourseAction({ courseId, body });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setFeedback(
        `Sent to ${result.recipients} student${result.recipients === 1 ? "" : "s"}.`,
      );
      setBody("");
      router.refresh();
    });
  }

  const selectedCourse = courses.find((c) => c.id === courseId);

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label
          htmlFor="ann-course"
          className="mb-1.5 block text-xs font-semibold"
        >
          Course
        </label>
        <select
          id="ann-course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-10 w-full rounded border border-[#d1d7dc] bg-white px-3 text-sm text-[#1c1d1f]"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} · {c.learners} learner{c.learners === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <label
          htmlFor="ann-body"
          className="mb-1.5 block text-xs font-semibold"
        >
          Message
        </label>
        <textarea
          id="ann-body"
          rows={6}
          required
          maxLength={4000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write what students should know…"
          className="w-full resize-y rounded border border-[#d1d7dc] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
        />
      </div>

      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#ececec] pt-4">
        <div className="text-xs text-[#6a6f73]">
          {selectedCourse
            ? `Will create or update threads with ${selectedCourse.learners} student${
                selectedCourse.learners === 1 ? "" : "s"
              }.`
            : "Pick a course to broadcast to."}
        </div>
        <div className="flex items-center gap-3">
          {feedback ? (
            <span className="text-xs font-semibold text-emerald-700">
              {feedback}
            </span>
          ) : null}
          {error ? (
            <span className="text-xs font-semibold text-rose-600">{error}</span>
          ) : null}
          <button
            type="submit"
            disabled={pending || !body.trim() || !courseId}
            className="inline-flex items-center gap-2 rounded-sm bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {pending ? "Sending…" : "Publish"}
          </button>
        </div>
      </div>
    </form>
  );
}
