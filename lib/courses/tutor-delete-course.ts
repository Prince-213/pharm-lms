import { revalidatePath } from "next/cache";

import { CoursePurchaseStatus } from "@/generated/prisma/enums";
import { deleteCourseWithStorage } from "@/lib/courses/delete-course-with-storage";
import {
  TUTOR_DELETABLE_STATUSES,
  type TutorDeleteCourseResult,
} from "@/lib/courses/tutor-delete-course-policy";
import { db } from "@/lib/db";

export type {
  TutorDeleteCourseErrorCode,
  TutorDeleteCourseResult,
} from "@/lib/courses/tutor-delete-course-policy";

export function revalidatePathsAfterCourseDelete() {
  revalidatePath("/tutor/courses");
  revalidatePath("/tutor/performance");
  revalidatePath("/student/browse");
  revalidatePath("/student/dashboard");
  revalidatePath("/student/courses");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/course-approvals");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/payments/transactions");
}

export async function tutorDeleteCourse(
  mentorId: string,
  courseId: string,
  confirmText: string,
): Promise<TutorDeleteCourseResult> {
  const course = await db.course.findFirst({
    where: { id: courseId, mentorId },
    select: {
      id: true,
      title: true,
      status: true,
      _count: {
        select: {
          purchases: {
            where: { status: CoursePurchaseStatus.SUCCESS },
          },
        },
      },
    },
  });

  if (!course) return { ok: false, error: "NOT_FOUND" };

  if (!TUTOR_DELETABLE_STATUSES.includes(course.status)) {
    return { ok: false, error: "LOCKED_STATUS" };
  }

  if (course._count.purchases > 0) {
    return { ok: false, error: "HAS_SALES" };
  }

  if (confirmText.trim() !== course.title.trim()) {
    return { ok: false, error: "CONFIRM_MISMATCH" };
  }

  const deleted = await deleteCourseWithStorage(courseId);
  if (!deleted.ok) return { ok: false, error: "NOT_FOUND" };

  await db.auditLog.create({
    data: {
      actorId: mentorId,
      action: "MENTOR_DELETE_COURSE",
      entityType: "Course",
      entityId: courseId,
      payload: { title: deleted.title, status: course.status },
    },
  });

  revalidatePathsAfterCourseDelete();

  return { ok: true, title: deleted.title };
}
