"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createLessonNoteAction,
  deleteLessonNoteAction,
  updateLessonNoteAction,
} from "@/app/student/actions/lesson-notes";
import { cn } from "@/lib/utils";

export type CourseNotesTabLesson = {
  id: string;
  title: string;
  sectionTitle: string;
};

export type CourseNotesTabNote = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export function CourseNotesTab({
  courseId,
  basePath,
  selectedLessonId,
  lessons,
  notes,
}: {
  courseId: string;
  basePath: string;
  selectedLessonId: string;
  lessons: CourseNotesTabLesson[];
  notes: CourseNotesTabNote[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  const lessonHref = useMemo(
    () => (lessonId: string) => {
      const p = new URLSearchParams();
      p.set("lesson", lessonId);
      p.set("tab", "notes");
      return `${basePath}?${p.toString()}`;
    },
    [basePath],
  );

  const onLessonChange = (lessonId: string) => {
    router.push(lessonHref(lessonId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex flex-col">
          <label
            htmlFor="notes-lecture-select"
            className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-soft)]"
          >
            Lecture
          </label>
          <select
            id="notes-lecture-select"
            value={selectedLessonId}
            onChange={(e) => onLessonChange(e.target.value)}
            className="mt-1 w-full max-w-xl rounded-md border border-[#d1d7dc] bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          >
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.sectionTitle}: {l.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-[#d1d7dc] bg-white">
        <div className="border-b border-[#ececec] px-4 py-3 sm:px-5">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            Your notes
          </h3>
          <p className="mt-0.5 text-xs text-[var(--muted-soft)]">
            Private to you. Add reminders and takeaways for this lecture.
          </p>
        </div>

        {notes.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[var(--muted)] sm:px-5">
            No notes for this lecture yet. Add one below.
          </p>
        ) : (
          <ul className="divide-y divide-[#ececec]">
            {notes.map((n) => (
              <li key={n.id} className="px-4 py-4 sm:px-5">
                {editingId === n.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={5}
                      className="w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const res = await updateLessonNoteAction({
                              courseId,
                              noteId: n.id,
                              body: editBody,
                            });
                            if (res.ok) {
                              setEditingId(null);
                              toast.success("Note updated.");
                              router.refresh();
                            } else {
                              toast.error(res.message);
                            }
                          });
                        }}
                        className="inline-flex h-9 items-center rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setEditingId(null)}
                        className="inline-flex h-9 items-center px-3 text-xs font-semibold text-[var(--muted)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                        {n.body}
                      </p>
                      <p className="mt-2 text-[11px] text-[var(--muted-soft)]">
                        {new Date(n.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="text-xs font-semibold text-[var(--primary)] hover:underline"
                        onClick={() => {
                          setEditingId(n.id);
                          setEditBody(n.body);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50"
                        onClick={() => {
                          if (!confirm("Delete this note?")) return;
                          startTransition(async () => {
                            const res = await deleteLessonNoteAction({
                              courseId,
                              noteId: n.id,
                            });
                            if (res.ok) {
                              toast.success("Note deleted.");
                              router.refresh();
                            } else {
                              toast.error(res.message);
                            }
                          });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className={cn("border-t border-[#ececec] p-4 sm:p-5")}>
          <label
            htmlFor="new-note"
            className="text-xs font-semibold text-[var(--foreground)]"
          >
            New note
          </label>
          <textarea
            id="new-note"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            maxLength={20_000}
            placeholder="Write a note for this lecture…"
            className="mt-2 w-full rounded-md border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-2 text-sm"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              disabled={isPending || !draft.trim()}
              onClick={() => {
                startTransition(async () => {
                  const res = await createLessonNoteAction({
                    courseId,
                    lessonId: selectedLessonId,
                    body: draft,
                  });
                  if (res.ok) {
                    setDraft("");
                    toast.success("Note saved.");
                    router.refresh();
                  } else {
                    toast.error(res.message);
                  }
                });
              }}
              className="inline-flex h-10 items-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
            >
              Save note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
