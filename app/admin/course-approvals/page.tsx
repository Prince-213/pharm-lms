import { AdminCoursesTable } from "@/components/admin/admin-courses-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { RouterRefreshInterval } from "@/components/system/router-refresh-interval";
import { CourseStatus } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export default async function AdminCourseApprovalsPage() {
  await requireAdminSession();

  const courses = await db.course.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      mentor: { select: { fullName: true, email: true } },
      sections: { select: { _count: { select: { lessons: true } } } },
      _count: { select: { enrollments: true } },
    },
  });

  const rows = courses.map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    priceMinorUnits: c.priceMinorUnits,
    priceCurrency: c.priceCurrency,
    lessonCount: c.sections.reduce((n, s) => n + s._count.lessons, 0),
    enrollmentCount: c._count.enrollments,
    mentorName: c.mentor.fullName,
    mentorEmail: c.mentor.email,
    rejectionReason: c.rejectionReason,
  }));

  const pending = courses.filter(
    (c) => c.status === CourseStatus.SUBMITTED,
  ).length;

  return (
    <>
      <RouterRefreshInterval intervalMs={20000} />
      <AdminPageHeader
        title="Courses"
        description="Review tutor submissions, publish approved content to the catalog, or return work with clear feedback. Typical LMS flow: draft → submitted → published (or rejected for revision)."
      />
      <AdminPanel
        title="Course catalog & review queue"
        description="Filter by status. Approve sends the course live as Published. Reject unlocks the studio for the tutor to revise and resubmit."
      >
        <div className="mb-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <span>
            <strong className="text-[var(--foreground)]">
              {courses.length}
            </strong>{" "}
            total
          </span>
          <span>
            <strong className="text-amber-800">{pending}</strong> awaiting
            review
          </span>
        </div>
        <AdminCoursesTable courses={rows} />
      </AdminPanel>
    </>
  );
}
