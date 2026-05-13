import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseForumExperience } from "@/components/course-forum/course-forum-experience";
import { UserRole } from "@/generated/prisma/enums";
import { getCourseForumData } from "@/lib/course-forum/get-course-forum-data";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

export default async function CourseForumPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/student/login");
  }

  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, mentorId: true },
  });
  if (!course) {
    redirect("/student/courses");
  }

  const role = session.user.role;
  if (role === UserRole.STUDENT) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        courseId_studentId: { courseId, studentId: session.user.id },
      },
      select: { id: true },
    });
    if (!enrollment) {
      redirect(`/student/browse/${courseId}`);
    }
    redirect(`/student/course/${courseId}?tab=forum`);
  } else if (role === UserRole.MENTOR || role === UserRole.TUTOR) {
    if (course.mentorId !== session.user.id) {
      redirect(role === UserRole.TUTOR ? "/tutor/courses" : "/mentor/courses");
    }
  } else if (role !== UserRole.ADMIN) {
    redirect(roleHomePath(role));
  }

  const { thread, badgeCountByStudent } = await getCourseForumData(courseId);

  return (
    <CourseForumExperience
      courseId={courseId}
      courseTitle={course.title}
      sessionUserId={session.user.id}
      posts={thread?.posts ?? []}
      badgeCountByStudent={badgeCountByStudent}
      variant="student"
    />
  );
}
