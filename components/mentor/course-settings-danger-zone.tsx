"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import type { CourseStatus } from "@/generated/prisma/enums";
import { toast } from "sonner";

import { deleteCourseAction } from "@/app/tutor/courses/[courseId]/manage/settings/actions";
import { DeleteCourseConfirmModal } from "@/components/mentor/delete-course-confirm-modal";
import { courseStatusLabel } from "@/lib/course-status-label";

export function CourseSettingsDangerZone({
  courseId,
  courseTitle,
  status,
  canDelete,
  hasSuccessfulPurchases,
}: {
  courseId: string;
  courseTitle: string;
  status: CourseStatus;
  canDelete: boolean;
  hasSuccessfulPurchases: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm(confirmText: string) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("courseId", courseId);
      formData.set("confirmText", confirmText);
      try {
        await deleteCourseAction(formData);
      } catch {
        setError("Something went wrong. Please try again.");
        toast.error("Could not delete course.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50/40 p-5">
      <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
      <p className="mt-1 text-xs text-red-900/80">
        Permanently remove this course and all related data:
      </p>
      <ul className="mt-2 list-inside list-disc text-xs text-red-900/70">
        <li>Sections, lessons, quizzes, and assignments</li>
        <li>Forum threads, meetings, and AI quiz attempts</li>
        <li>Uploaded videos, files, and thumbnails (cloud storage)</li>
        <li>Enrollments, wishlists, and analytics visits</li>
      </ul>

      {hasSuccessfulPurchases ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          This course has successful purchases and cannot be deleted. Contact
          an administrator if you need it removed.
        </p>
      ) : canDelete ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setModalOpen(true);
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete course permanently
        </button>
      ) : (
        <p className="mt-4 text-xs text-slate-600">
          This course is <strong>{courseStatusLabel(status)}</strong>.
          Only draft or rejected courses without sales can be deleted by tutors.
        </p>
      )}

      <DeleteCourseConfirmModal
        courseTitle={courseTitle}
        open={modalOpen}
        onClose={() => {
          if (!isPending) {
            setModalOpen(false);
            setError(null);
          }
        }}
        onConfirm={handleConfirm}
        deleting={isPending}
        error={error}
        title="Delete course"
      />
    </div>
  );
}
