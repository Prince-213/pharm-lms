import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";
import { studentMayAccessCourseContent } from "@/lib/payments/student-course-access";

export default async function AIQuizPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login");
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const { courseId } = await params;
  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: { courseId, studentId: session.user.id },
    },
    select: { id: true },
  });
  if (!enrollment) {
    redirect(`/student/browse/${courseId}`);
  }

  if (!(await studentMayAccessCourseContent(session.user.id, courseId))) {
    redirect(`/student/browse/${courseId}`);
  }

  const course = await db.course.findFirst({
    where: { id: courseId, status: CourseStatus.PUBLISHED },
    select: { id: true },
  });
  if (!course) notFound();

  redirect(`/student/course/${courseId}?tab=ai-quiz`);
}
