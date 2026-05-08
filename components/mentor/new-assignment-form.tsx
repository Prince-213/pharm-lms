"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createAssignmentAction } from "@/app/tutor/assignments/actions";

export function NewAssignmentForm({
  courses,
}: {
  courses: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [publish, setPublish] = useState(true);

  function reset() {
    setTitle("");
    setDescription("");
    setDueAt("");
    setError(null);
    setPublish(true);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createAssignmentAction({
        courseId,
        title: title.trim(),
        description: description.trim(),
        dueAt: dueAt || undefined,
        publish,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      reset();
      setOpen(false);
      router.refresh();
    });
  }

  if (courses.length === 0) {
    return (
      <p className="rounded border border-dashed border-[#d1d7dc] bg-white p-4 text-sm text-[#6a6f73]">
        Publish a course first — assignments need a course to live in.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[#e3e5e8] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[#1c1d1f]">
            Assignment composer
          </h3>
          <p className="mt-1 text-sm text-[#6a6f73]">
            Create a written task linked to one of your courses. Students will
            see it in the course page (and we&apos;ll notify them as messaging
            matures).
          </p>
        </div>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-strong)]"
          >
            <Plus className="h-4 w-4" />
            New assignment
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2 text-sm">
            <span className="font-semibold text-[#1c1d1f]">Title</span>
            <input
              required
              minLength={2}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Case study: counseling adherence"
              className="mt-1 h-10 w-full rounded border border-[#d1d7dc] bg-white px-3 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[#1c1d1f]">Course</span>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="mt-1 h-10 w-full rounded border border-[#d1d7dc] bg-white px-3 text-sm"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[#1c1d1f]">
              Due date (optional)
            </span>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="mt-1 h-10 w-full rounded border border-[#d1d7dc] bg-white px-3 text-sm"
            />
          </label>
          <label className="md:col-span-2 text-sm">
            <span className="font-semibold text-[#1c1d1f]">Instructions</span>
            <textarea
              required
              minLength={2}
              maxLength={4000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should students do? Include acceptance criteria and submission format."
              className="mt-1 w-full resize-y rounded border border-[#d1d7dc] bg-white px-3 py-2 text-sm leading-relaxed"
            />
          </label>
          <label className="md:col-span-2 flex items-center gap-2 text-sm text-[#1c1d1f]">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
            />
            Send immediately (uncheck to save as draft)
          </label>
          {error ? (
            <p className="md:col-span-2 text-sm text-rose-600">{error}</p>
          ) : null}
          <div className="md:col-span-2 flex items-center justify-end gap-2 border-t border-[#ececec] pt-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="rounded px-3 py-2 text-sm font-semibold text-[#6a6f73] hover:text-[#1c1d1f]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-strong)] disabled:opacity-60"
            >
              {pending ? "Saving…" : "Create assignment"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
