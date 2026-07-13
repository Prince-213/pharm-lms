import { NextResponse } from "next/server";
import { CourseStatus } from "@/generated/prisma/enums";
import {
  revalidateAdminPortal,
  revalidateCourseSurfaces,
} from "@/lib/cache/revalidate-portals";
import { db } from "@/lib/db";
import { requireMentorCourseEditable } from "@/lib/mentor-course-auth";
import { sendEmail } from "@/lib/notifications/email-service";
import { getSubmissionTemplate } from "@/lib/notifications/email-templates";
import { notifyAdminsCourseSubmittedForReview } from "@/lib/notifications/course-events";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const authz = await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      sections: { include: { lessons: true } },
    },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const details: string[] = [];

  if (!course.title || course.title.length < 3) {
    details.push("Course title is required.");
  }
  const descriptionPlain = course.description.replace(/<[^>]+>/g, " ").trim();
  if (descriptionPlain.length < 50) {
    details.push("Course description must be at least 50 characters of text.");
  }
  if (!course.language?.trim()) {
    details.push("Language is required.");
  }
  if (!course.level?.trim()) {
    details.push("Level is required.");
  }
  if (!course.primaryTopic?.trim()) {
    details.push("Primary topic is required.");
  }
  if (!course.thumbnailUrl?.trim()) {
    details.push("Upload a course cover image on the landing page.");
  }
  if (
    course.priceMinorUnits === null ||
    course.priceMinorUnits === undefined ||
    course.priceMinorUnits < 0
  ) {
    details.push("Mark as free or set a price on the pricing step.");
  }
  if (!course.congratulatoryTitle?.trim()) {
    details.push("Congratulations title is required.");
  }
  if (course.congratulatoryContentType === "VIDEO") {
    if (!course.congratulatoryVideoUrl?.trim()) {
      details.push("Upload a congratulations video or switch to article.");
    }
  } else if (course.congratulatoryContentType === "ARTICLE") {
    if (
      !course.congratulatoryArticle ||
      course.congratulatoryArticle.length < 20
    ) {
      details.push("Congratulations article content is required.");
    }
  } else {
    details.push("Choose congratulations content type (video or article).");
  }

  const hasLesson = course.sections.some((s) => s.lessons.length > 0);
  if (!hasLesson) {
    details.push("Add at least one curriculum lecture before submitting.");
  }

  if (details.length) {
    return NextResponse.json(
      { error: "Complete required fields first.", details },
      { status: 400 },
    );
  }

  const previousStatus = authz.course.status;

  await db.$transaction([
    db.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.SUBMITTED },
    }),
    db.courseApprovalWorkflow.create({
      data: {
        courseId,
        previousStatus,
        newStatus: CourseStatus.SUBMITTED,
        reviewedById: authz.session.user.id,
        note: "Mentor submitted course for review",
      },
    }),
  ]);

  revalidateCourseSurfaces(courseId);
  revalidateAdminPortal(courseId);

  const userEmail = authz.session.user.email;
  const userName = authz.session.user.name;
  if (userEmail && userName) {
    void sendEmail({
      to: userEmail,
      subject: `Submission Received: ${course.title}`,
      html: getSubmissionTemplate(course.title, userName),
    });
  }

  void notifyAdminsCourseSubmittedForReview(
    courseId,
    course.title,
    userName ?? "A tutor",
  );

  return NextResponse.json({ success: true, status: CourseStatus.SUBMITTED });
}
