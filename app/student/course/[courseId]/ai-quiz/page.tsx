import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AiQuizWorkspace } from "@/components/student/ai-quiz-workspace";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

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

  const course = await db.course.findFirst({
    where: { id: courseId, status: CourseStatus.PUBLISHED },
    select: {
      id: true,
      title: true,
      sections: { select: { id: true } },
    },
  });
  if (!course) notFound();

  const completedLessons = await db.lessonProgress.findMany({
    where: {
      studentId: session.user.id,
      completed: true,
      lesson: { section: { courseId } },
    },
    select: { lesson: { select: { sectionId: true } } },
  });
  const completedSectionIds = [
    ...new Set(completedLessons.map((p) => p.lesson.sectionId)),
  ];

  return (
    <AiQuizWorkspace
      courseId={course.id}
      courseTitle={course.title}
      completedSectionsCount={completedSectionIds.length}
    />
  );
}
