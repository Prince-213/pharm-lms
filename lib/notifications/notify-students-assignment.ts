import { AssignmentStatus, EnrollmentStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

/**
 * In-app notification for each actively enrolled student when an assignment is published (SENT).
 */
export async function notifyStudentsNewAssignment(
  assignmentId: string,
): Promise<void> {
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      title: true,
      status: true,
      courseId: true,
      course: { select: { title: true } },
    },
  });
  if (!assignment || assignment.status !== AssignmentStatus.SENT) return;

  const enrollments = await db.enrollment.findMany({
    where: {
      courseId: assignment.courseId,
      status: EnrollmentStatus.ACTIVE,
    },
    select: { studentId: true },
  });
  if (enrollments.length === 0) return;

  const href = "/student/assignments";
  const title = `New assignment: ${assignment.title}`;
  const body = `Posted in ${assignment.course.title}.`;

  await db.notification.createMany({
    data: enrollments.map((e) => ({
      userId: e.studentId,
      kind: "ASSIGNMENT_PUBLISHED",
      title,
      body,
      href,
      assignmentId: assignment.id,
    })),
  });
}
