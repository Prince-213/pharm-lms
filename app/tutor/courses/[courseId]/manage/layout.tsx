import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseManageFrame } from "@/components/mentor/course-manage-frame";
import { CourseStudioProvider } from "@/components/mentor/course-studio-context";
import { InstructorFooter } from "@/components/mentor/instructor-shell";
import { CourseStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { courseStatusLabel } from "@/lib/mentor-course-auth";

export default async function MentorCourseManageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");

  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
    select: { id: true, title: true, status: true },
  });
  if (!course) notFound();

  const readOnly =
    course.status === CourseStatus.SUBMITTED ||
    course.status === CourseStatus.APPROVED ||
    course.status === CourseStatus.PUBLISHED;

  return (
    <CourseStudioProvider value={{ readOnly }}>
      <div className="min-h-screen bg-[var(--surface-muted)] text-[var(--foreground)]">
        <CourseManageFrame
          courseId={courseId}
          courseTitle={course.title}
          statusLabel={courseStatusLabel(course.status)}
          courseStatus={course.status}
          readOnly={readOnly}
          settingsHref={`/tutor/courses/${courseId}/manage/settings`}
        >
          {children}
        </CourseManageFrame>
        <InstructorFooter />
      </div>
    </CourseStudioProvider>
  );
}
