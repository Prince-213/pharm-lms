import { CoursePurchaseStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

/** Paid courses require a successful CoursePurchase for access. */
export async function studentHasPaidCourseAccess(
  studentId: string,
  course: { id: string; priceMinorUnits: number | null },
): Promise<boolean> {
  const price = course.priceMinorUnits ?? 0;
  if (price <= 0) return true;

  const purchase = await db.coursePurchase.findFirst({
    where: {
      courseId: course.id,
      studentId,
      status: CoursePurchaseStatus.SUCCESS,
    },
    select: { id: true },
  });
  return Boolean(purchase);
}

/** Enrollment present and paid if course is priced. */
export async function studentMayAccessCourseContent(
  studentId: string,
  courseId: string,
): Promise<boolean> {
  const enrollment = await db.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
  });
  if (!enrollment) return false;

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { priceMinorUnits: true },
  });
  if (!course) return false;

  return studentHasPaidCourseAccess(studentId, {
    id: courseId,
    priceMinorUnits: course.priceMinorUnits,
  });
}
