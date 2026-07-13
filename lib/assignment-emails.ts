import { AssignmentStatus, EnrollmentStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import {
  getAssignmentSubmittedEmailTemplate,
  getNewAssignmentEmailTemplate,
} from "@/lib/notifications/email-templates";
import { sendEmail } from "@/lib/notifications/email-service";

function appBaseUrl() {
  return (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
}

/**
 * Email all actively enrolled students when an assignment is open (SENT).
 */
export async function emailEnrolledStudentsNewAssignment(
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
    include: {
      student: { select: { email: true, fullName: true } },
    },
  });

  const baseUrl = appBaseUrl();
  const assignmentsUrl = `${baseUrl}/student/assignments`;

  for (const e of enrollments) {
    const firstName = e.student.fullName.trim().split(/\s+/)[0] || "there";
    void sendEmail({
      to: e.student.email,
      subject: `New assignment: ${assignment.title}`,
      html: getNewAssignmentEmailTemplate({
        studentName: firstName,
        courseTitle: assignment.course.title,
        assignmentTitle: assignment.title,
        assignmentsUrl,
      }),
    }).catch((err) => {
      console.error(
        "[assignment-emails] sendEmail failed for new assignment",
        e.student.email,
        err,
      );
    });
  }
}

export async function emailTutorAssignmentSubmitted(opts: {
  mentorEmail: string;
  mentorName: string;
  studentName: string;
  courseTitle: string;
  assignmentTitle: string;
  assignmentId: string;
}): Promise<void> {
  const baseUrl = appBaseUrl();
  const reviewUrl = `${baseUrl}/tutor/assignments/${opts.assignmentId}`;
  void sendEmail({
    to: opts.mentorEmail,
    subject: `Submission: ${opts.assignmentTitle}`,
    html: getAssignmentSubmittedEmailTemplate({
      mentorName: opts.mentorName.split(/\s+/)[0] || opts.mentorName,
      studentName: opts.studentName,
      courseTitle: opts.courseTitle,
      assignmentTitle: opts.assignmentTitle,
      reviewUrl,
    }),
  }).catch(() => {});
}
