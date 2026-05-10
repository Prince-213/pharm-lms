import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseForumExperience } from "@/components/course-forum/course-forum-experience";
import { UserRole } from "@/generated/prisma/enums";
import { getCourseForumData } from "@/lib/course-forum/get-course-forum-data";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import { roleHomePath } from "@/lib/rbac";

export default async function TutorCommunicationForumCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/tutor/login?callbackUrl=/tutor/communication/forums");
  }
  if (session.user.role !== UserRole.TUTOR) {
    redirect(roleHomePath(session.user.role));
  }

  const { courseId } = await params;
  const course = await withDbRetry(() =>
    db.course.findFirst({
      where: { id: courseId, mentorId: session.user.id },
      select: { id: true, title: true },
    }),
  );

  if (!course) {
    redirect("/tutor/communication/forums");
  }

  const { thread, badgeCountByStudent } = await withDbRetry(() =>
    getCourseForumData(courseId),
  );

  return (
    <div className="px-5 py-6 sm:px-8">
      <CourseForumExperience
        courseId={courseId}
        courseTitle={course.title}
        sessionUserId={session.user.id}
        posts={thread?.posts ?? []}
        badgeCountByStudent={badgeCountByStudent}
        variant="tutor"
        backLink={{
          href: "/tutor/communication/forums",
          label: "All course forums",
        }}
      />
    </div>
  );
}
