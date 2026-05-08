"use client";

import { MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { unenrollFromCourseAction } from "@/app/student/actions/enrollment";

export function EnrolledCourseMenu({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const node = containerRef.current;
      if (node && !node.contains(event.target as Node)) {
        setOpen(false);
        setConfirming(false);
        setError(null);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirming(false);
        setError(null);
      }
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleUnenroll() {
    setError(null);
    startTransition(async () => {
      const result = await unenrollFromCourseAction(courseId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOpen(false);
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <div ref={containerRef} className="absolute right-2 top-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More options"
        className="rounded-full bg-[var(--surface)]/95 p-1.5 text-[var(--foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface)]"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={2} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={`Options for ${courseTitle}`}
          className="absolute right-0 top-9 z-20 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm shadow-lg"
        >
          {confirming ? (
            <div className="space-y-2 p-1">
              <p className="text-xs text-[var(--foreground)]">
                Unenroll from <strong>{courseTitle}</strong>? Your progress
                will be saved if you re-enroll later.
              </p>
              {error ? (
                <p className="text-xs font-medium text-rose-600">{error}</p>
              ) : null}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setError(null);
                  }}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUnenroll}
                  disabled={pending}
                  className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  <Trash2 className="h-3 w-3" />
                  {pending ? "Removing…" : "Confirm unenroll"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirming(true)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Unenroll from course
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
