"use client";

import { MoreVertical, Trash2, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CourseStatus } from "@/generated/prisma/enums";

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

function DeleteDraftModal({
  courseTitle,
  onCancel,
  onConfirm,
  deleting,
  error,
}: {
  courseTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
  error: string | null;
}) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = typed.trim() === courseTitle.trim();

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Panel */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
        {/* Header stripe */}
        <div className="flex items-start gap-4 bg-red-50 px-6 py-5 border-b border-red-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-red-700">Delete Draft Course</h2>
            <p className="mt-0.5 text-sm text-red-600/80">
              This action is permanent and cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="shrink-0 rounded-md p-1 text-red-400 hover:bg-red-100 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 leading-relaxed">
            You are about to permanently delete{" "}
            <span className="font-bold text-slate-900">"{courseTitle}"</span> and{" "}
            <span className="font-semibold">all its content</span> — lessons, quizzes, assignments,
            and resources. Students who enrolled will lose access.
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              To confirm, type the exact course name below:
            </label>
            <p className="mb-2 rounded bg-slate-100 px-3 py-1.5 font-mono text-sm text-slate-700 select-all">
              {courseTitle}
            </p>
            <input
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={deleting}
              placeholder="Type course name here…"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:bg-slate-50 ${
                typed && !matches
                  ? "border-red-300 focus:ring-red-200"
                  : typed && matches
                    ? "border-emerald-400 focus:ring-emerald-200"
                    : "border-slate-300 focus:ring-slate-200"
              }`}
            />
            {typed && !matches && (
              <p className="mt-1 text-xs text-red-500">Name does not match — check capitalisation.</p>
            )}
            {typed && matches && (
              <p className="mt-1 text-xs text-emerald-600">✓ Name confirmed.</p>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!matches || deleting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CourseCardMenu ────────────────────────────────────────────────────────────

export function CourseCardMenu({
  courseId,
  courseTitle,
  status,
}: {
  courseId: string;
  courseTitle: string;
  status: CourseStatus;
}) {
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isDraft = status === CourseStatus.DRAFT;

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tutor/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        const msg = data?.error ?? "Failed to delete course.";
        setError(msg);
        toast.error(msg);
        setDeleting(false);
        return;
      }
      setShowModal(false);
      toast.success("Draft course deleted.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#64748b] transition hover:bg-slate-100 hover:text-[#1e293b]"
          aria-label="Course options"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-10 z-40 min-w-[188px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
          >
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Course Options
              </p>
            </div>

            {isDraft ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                  setShowModal(true);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                Delete draft
              </button>
            ) : (
              <div className="px-4 py-3 text-xs text-slate-400 italic">
                Only draft courses can be deleted.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <DeleteDraftModal
          courseTitle={courseTitle}
          onCancel={() => { setShowModal(false); setError(null); }}
          onConfirm={() => void handleDelete()}
          deleting={deleting}
          error={error}
        />
      )}
    </>
  );
}
