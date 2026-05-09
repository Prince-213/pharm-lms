import { getCourseReviewReceivedEmailTemplate } from "@/lib/notifications/email-templates";
import { sendEmail } from "@/lib/notifications/email-service";

function appBaseUrl() {
  return (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function emailTutorCourseReview(opts: {
  mentorEmail: string;
  mentorName: string;
  studentName: string;
  courseTitle: string;
  rating: number;
  commentSnippet: string | null;
}): Promise<void> {
  const baseUrl = appBaseUrl();
  const reviewsUrl = `${baseUrl}/tutor/performance/reviews`;
  const preview =
    opts.commentSnippet && opts.commentSnippet.trim().length > 0
      ? escapeHtml(opts.commentSnippet.trim().slice(0, 400))
      : "";
  void sendEmail({
    to: opts.mentorEmail,
    subject: `New review: ${opts.courseTitle} (${opts.rating}★)`,
    html: getCourseReviewReceivedEmailTemplate({
      mentorName: opts.mentorName.split(/\s+/)[0] || opts.mentorName,
      studentName: opts.studentName,
      courseTitle: opts.courseTitle,
      rating: opts.rating,
      commentPreview: preview,
      reviewsUrl,
    }),
  }).catch(() => {});
}
