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
  const [instructionsLinkUrl, setInstructionsLinkUrl] = useState("");
  const [instructionsLinkLabel, setInstructionsLinkLabel] = useState("");
  const [handoutFile, setHandoutFile] = useState<File | null>(null);
  const [uploadingHandout, setUploadingHandout] = useState(false);

  function reset() {
    setTitle("");
    setDescription("");
    setDueAt("");
    setError(null);
    setPublish(true);
    setInstructionsLinkUrl("");
    setInstructionsLinkLabel("");
    setHandoutFile(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!courseId) {
      setError("Select a course.");
      return;
    }

    startTransition(async () => {
      let instructionsFileUrl: string | undefined;

      if (handoutFile) {
        setUploadingHandout(true);
        try {
          const fd = new FormData();
          fd.set("file", handoutFile);
          fd.set("purpose", "assignment-handout");
          const up = await fetch(`/api/tutor/courses/${courseId}/upload`, {
            method: "POST",
            body: fd,
          });
          if (!up.ok) {
            const j = (await up.json().catch(() => null)) as {
              error?: string;
            } | null;
            setError(
              typeof j?.error === "string" ? j.error : "Handout upload failed.",
            );
            setUploadingHandout(false);
            return;
          }
          const data = (await up.json()) as { url: string };
          instructionsFileUrl = data.url;
        } catch {
          setError("Handout upload failed.");
          setUploadingHandout(false);
          return;
        }
        setUploadingHandout(false);
      }

      const result = await createAssignmentAction({
        courseId,
        title: title.trim(),
        description: description.trim(),
        dueAt: dueAt || undefined,
        publish,
        instructionsFileUrl,
        instructionsLinkUrl: instructionsLinkUrl.trim() || undefined,
        instructionsLinkLabel: instructionsLinkLabel.trim() || undefined,
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
      <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        Create a course first — assignments must belong to one of your courses.
      </p>
    );
  }

  const control =
    "mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]";

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)]">
            Assignment composer
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Pick a course (required), add instructions, and optionally attach a
            handout file or reference link. Enrolled students are emailed when
            you publish.
          </p>
        </div>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-strong)]"
          >
            <Plus className="h-4 w-4" />
            New assignment
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2 text-sm">
            <span className="font-semibold text-[var(--foreground)]">
              Title
            </span>
            <input
              required
              minLength={2}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Case study: counseling adherence"
              className={control}
            />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="font-semibold text-[var(--foreground)]">
              Course <span className="text-rose-600">*</span>
            </span>
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className={control}
            >
              <option value="" disabled>
                Select a course
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--foreground)]">
              Due date (optional)
            </span>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className={control}
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--foreground)]">
              Handout file (optional)
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg,.webp,.ppt,.pptx,.xls,.xlsx"
              onChange={(e) => setHandoutFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-xs text-[var(--muted)] file:mr-2 file:rounded file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-2 file:py-1 file:text-sm file:text-[var(--foreground)]"
            />
          </label>
          <label className="md:col-span-2 text-sm">
            <span className="font-semibold text-[var(--foreground)]">
              Reference link (optional)
            </span>
            <input
              type="url"
              value={instructionsLinkUrl}
              onChange={(e) => setInstructionsLinkUrl(e.target.value)}
              placeholder="https://..."
              className={control}
            />
          </label>
          <label className="md:col-span-2 text-sm">
            <span className="font-semibold text-[var(--foreground)]">
              Link label (optional)
            </span>
            <input
              maxLength={120}
              value={instructionsLinkLabel}
              onChange={(e) => setInstructionsLinkLabel(e.target.value)}
              placeholder="Shown as button text; defaults to “Open link”"
              className={control}
            />
          </label>
          <label className="md:col-span-2 text-sm">
            <span className="font-semibold text-[var(--foreground)]">
              Instructions
            </span>
            <textarea
              required
              minLength={2}
              maxLength={4000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What should students do? Include acceptance criteria and submission format."
              className="mt-1 w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-relaxed text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
            />
          </label>
          <label className="md:col-span-2 flex items-center gap-2 text-sm text-[var(--foreground)]">
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
          <div className="md:col-span-2 flex items-center justify-end gap-2 border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="rounded px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || uploadingHandout || !courseId}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-strong)] disabled:opacity-60"
            >
              {pending || uploadingHandout ? "Saving…" : "Create assignment"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
