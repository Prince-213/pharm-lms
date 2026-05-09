import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCoursePreviewView } from "@/components/admin/admin-course-preview-view";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  COURSE_ANNOUNCEMENTS_THREAD_TITLE,
  COURSE_GENERAL_FORUM_THREAD_TITLE,
} from "@/lib/course-discussions";
import { requireAdminSession } from "@/lib/admin-auth";
import { parseSectionDescription } from "@/lib/curriculum";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";

export default async function AdminCoursePreviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireAdminSession();
  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      mentor: { select: { id: true, fullName: true, email: true } },
      sections: {
        orderBy: { position: "asc" },
        include: {
          lessons: { orderBy: { position: "asc" } },
        },
      },
      enrollments: { select: { id: true } },
      forums: {
        include: {
          posts: {
            orderBy: { createdAt: "desc" },
            include: {
              author: { select: { fullName: true, role: true } },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const announcementsThread =
    course.forums.find((f) => f.title === COURSE_ANNOUNCEMENTS_THREAD_TITLE) ?? null;
  const forumThread =
    course.forums.find((f) => f.title === COURSE_GENERAL_FORUM_THREAD_TITLE) ?? null;

  const lessonCount = course.sections.reduce((n, s) => n + s.lessons.length, 0);

  const sectionsPayload = await Promise.all(
    course.sections.map(async (s) => {
      const parsed = parseSectionDescription(s.description);
      const resources = await Promise.all(
        parsed.resources.map(async (r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          url: r.url,
          originalFileName: r.originalFileName,
          sizeBytes: r.sizeBytes,
          mimeType: r.mimeType,
          resolvedHref: await resolveMediaUrl(r.url),
        })),
      );
      const lessons = await Promise.all(
        s.lessons.map(async (l) => ({
          id: l.id,
          title: l.title,
          content: l.content,
          videoUrl: l.videoUrl,
          videoResolvedHref: await resolveMediaUrl(l.videoUrl),
        })),
      );
      return {
        id: s.id,
        title: s.title,
        descriptionText: parsed.text,
        resources,
        lessons,
      };
    }),
  );

  const payload = {
    courseId,
    title: course.title,
    subtitle: course.subtitle,
    status: course.status,
    rejectionReason: course.rejectionReason,
    formattedPrice: formatMinorUnitsToCurrency(course.priceMinorUnits, course.priceCurrency),
    description: course.description,
    welcomeMessage: course.welcomeMessage,
    congratulatoryTitle: course.congratulatoryTitle,
    congratulatoryContentType: course.congratulatoryContentType,
    congratulatoryMessage: course.congratulatoryMessage,
    congratulatoryArticle: course.congratulatoryArticle,
    congratulatoryVideoUrl: course.congratulatoryVideoUrl,
    category: course.category,
    subcategory: course.subcategory,
    level: course.level,
    language: course.language,
    primaryTopic: course.primaryTopic,
    mentor: {
      fullName: course.mentor.fullName,
      email: course.mentor.email,
    },
    sectionCount: course.sections.length,
    lessonCount,
    enrollmentCount: course.enrollments.length,
    sections: sectionsPayload,
    announcements: (announcementsThread?.posts ?? []).map((p) => ({
      id: p.id,
      body: p.body,
      createdAtIso: p.createdAt.toISOString(),
    })),
    forumPosts: (forumThread?.posts ?? []).map((p) => ({
      id: p.id,
      body: p.body,
      createdAtIso: p.createdAt.toISOString(),
      authorName: p.author.fullName,
      authorRole: p.author.role,
    })),
  };

  return (
    <>
      <AdminPageHeader
        title="Course preview"
        description="Read-only inspection of catalog copy, curriculum structure, and course discussions. Use the tabs below to focus each area."
      >
        <Link
          href="/admin/course-approvals"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--background)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
      </AdminPageHeader>

      <AdminCoursePreviewView data={payload} />
    </>
  );
}
