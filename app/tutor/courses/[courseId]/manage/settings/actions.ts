"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { tutorDeleteCourse } from "@/lib/courses/tutor-delete-course";

export async function deleteCourseAction(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "");
  const confirmText = String(formData.get("confirmText") ?? "").trim();

  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    redirect("/tutor/login");
  }

  const result = await tutorDeleteCourse(session.user.id, courseId, confirmText);

  if (!result.ok) {
    const base = `/tutor/courses/${courseId}/manage/settings`;
    switch (result.error) {
      case "NOT_FOUND":
        redirect("/tutor/courses?error=course-not-found");
      case "LOCKED_STATUS":
        redirect(`${base}?error=locked-status`);
      case "HAS_SALES":
        redirect(`${base}?error=has-sales`);
      case "CONFIRM_MISMATCH":
        redirect(`${base}?error=confirm-title`);
    }
  }

  redirect("/tutor/courses?deleted=1");
}

/** @deprecated Use deleteCourseAction */
export const deleteDraftCourseAction = deleteCourseAction;
