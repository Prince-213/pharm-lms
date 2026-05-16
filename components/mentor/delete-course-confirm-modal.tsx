"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function DeleteCourseConfirmModal({
  courseTitle,
  open,
  onClose,
  onConfirm,
  deleting,
  error,
  title = "Delete course",
  description,
}: {
  courseTitle: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (confirmText: string) => void;
  deleting: boolean;
  error: string | null;
  title?: string;
  description?: string;
}) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = typed.trim() === courseTitle.trim();

  useEffect(() => {
    if (!open) {
      setTyped("");
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const bodyCopy =
    description ??
    `You are about to permanently delete "${courseTitle}" and all its content — lessons, quizzes, assignments, and uploaded files. This cannot be undone.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-start gap-4 border-b border-red-100 bg-red-50 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-red-700">{title}</h2>
            <p className="mt-0.5 text-sm text-red-600/80">
              This action is permanent and cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="shrink-0 rounded-md p-1 text-red-400 hover:bg-red-100 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
            {bodyCopy}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              To confirm, type the exact course name below:
            </label>
            <p className="mb-2 select-all rounded bg-slate-100 px-3 py-1.5 font-mono text-sm text-slate-700">
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
            {typed && !matches ? (
              <p className="mt-1 text-xs text-red-500">
                Name does not match — check capitalisation.
              </p>
            ) : null}
            {typed && matches ? (
              <p className="mt-1 text-xs text-emerald-600">✓ Name confirmed.</p>
            ) : null}
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(typed.trim())}
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
