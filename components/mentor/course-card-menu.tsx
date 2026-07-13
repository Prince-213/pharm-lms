"use client";

import { MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import { CourseStatus } from "@/generated/prisma/enums";
import { DeleteCourseConfirmModal } from "@/components/mentor/delete-course-confirm-modal";
import { canTutorDeleteCourse } from "@/lib/courses/tutor-delete-course-policy";

export function CourseCardMenu({
  courseId,
  courseTitle,
  status,
  hasSuccessfulPurchases = false,
}: {
  courseId: string;
  courseTitle: string;
  status: CourseStatus;
  hasSuccessfulPurchases?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const canDelete = canTutorDeleteCourse(status, hasSuccessfulPurchases);

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

  async function handleDelete(confirmText: string) {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tutor/courses/${courseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText }),
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
      toast.success("Course deleted.");
      refreshPortalAfterMutation(router);
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
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Course Options
              </p>
            </div>

            {canDelete ? (
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
                Delete course
              </button>
            ) : hasSuccessfulPurchases ? (
              <div className="px-4 py-3 text-xs italic text-amber-700">
                Cannot delete — course has sales.
              </div>
            ) : (
              <div className="px-4 py-3 text-xs italic text-slate-400">
                Only draft or rejected courses can be deleted.
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteCourseConfirmModal
        courseTitle={courseTitle}
        open={showModal}
        onClose={() => {
          if (!deleting) {
            setShowModal(false);
            setError(null);
          }
        }}
        onConfirm={(confirmText) => void handleDelete(confirmText)}
        deleting={deleting}
        error={error}
        title={
          status === CourseStatus.DRAFT ? "Delete draft course" : "Delete rejected course"
        }
      />
    </>
  );
}
