import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { createNotification, createNotifications } from "@/lib/notifications/notification-service";

function appBaseUrl() {
  return (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
}

export async function notifyAdminsCourseSubmittedForReview(
  courseId: string,
  courseTitle: string,
  tutorName: string,
) {
  const admins = await db.user.findMany({
    where: { role: UserRole.ADMIN, isActive: true },
    select: { id: true },
    take: 50,
  });
  if (admins.length === 0) return;

  const href = "/admin/course-approvals";
  await createNotifications(
    admins.map((admin) => ({
      userId: admin.id,
      kind: "COURSE_SUBMITTED_FOR_REVIEW",
      title: "Course submitted for review",
      body: `${tutorName} submitted "${courseTitle}" for approval.`,
      href,
    })),
  );
}

export async function notifyTutorCourseApproved(
  tutorId: string,
  courseId: string,
  courseTitle: string,
) {
  const href = `/tutor/courses/${courseId}/manage/curriculum`;
  const browseHref = `/student/browse/${courseId}`;
  const base = appBaseUrl();

  await createNotification({
    userId: tutorId,
    kind: "COURSE_APPROVED",
    title: "Course published",
    body: `"${courseTitle}" was approved and is now live for students.`,
    href,
  });

  void base;
  void browseHref;
}

export async function notifyTutorCourseRejected(
  tutorId: string,
  courseId: string,
  courseTitle: string,
  reason: string,
) {
  const href = `/tutor/courses/${courseId}/manage/curriculum`;
  const snippet =
    reason.length > 120 ? `${reason.slice(0, 117)}…` : reason;

  await createNotification({
    userId: tutorId,
    kind: "COURSE_REJECTED",
    title: "Course needs revisions",
    body: `"${courseTitle}" was returned: ${snippet}`,
    href,
  });
}
