import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { CourseStatus } from "@/generated/prisma/enums";
import { CourseManageSidebar } from "@/components/mentor/course-manage-sidebar";
import { CourseStudioProvider } from "@/components/mentor/course-studio-context";
import {
  InstructorFooter,
  InstructorShell,
} from "@/components/mentor/instructor-shell";
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
  if (!session?.user) redirect("/mentor/login");

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
      <InstructorShell
        courseId={courseId}
        courseTitle={course.title}
        statusLabel={courseStatusLabel(course.status)}
        readOnly={readOnly}
        settingsHref={`/mentor/courses/${courseId}/manage/settings`}
      >
        <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1280px] bg-white">
          <CourseManageSidebar courseId={courseId} courseStatus={course.status} />
          <div className="flex-1 bg-[#f7f7f8] p-6">{children}</div>
        </div>
        <InstructorFooter />
      </InstructorShell>
    </CourseStudioProvider>
  );
}
