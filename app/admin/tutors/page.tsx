import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPeopleCrmTable } from "@/components/admin/admin-people-crm-table";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export default async function AdminTutorsPage() {
  await requireAdminSession();

  const tutors = await db.user.findMany({
    where: { role: UserRole.TUTOR },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      createdAt: true,
      courses: { select: { status: true } },
    },
  });

  const rows = tutors.map((t) => {
    const courseCount = t.courses.length;
    const publishedCount = t.courses.filter((c) => c.status === CourseStatus.PUBLISHED).length;
    return {
      id: t.id,
      fullName: t.fullName,
      email: t.email,
      role: UserRole.TUTOR,
      isActive: t.isActive,
      createdAtIso: t.createdAt.toISOString(),
      primaryMetricLabel: "Courses",
      primaryMetricValue: courseCount,
      secondaryMetricLabel: "Published",
      secondaryMetricValue: publishedCount,
    };
  });

  const activeCount = tutors.filter((t) => t.isActive).length;
  const inactiveCount = tutors.length - activeCount;
  const totalCourses = tutors.reduce((sum, t) => sum + t.courses.length, 0);

  return (
    <>
      <AdminPageHeader
        title="Tutors CRM"
        description="Manage course creator accounts, catalog output, and publishing activity across the platform."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total tutors" value={tutors.length} hint="All tutor accounts" />
        <AdminStatCard label="Active tutors" value={activeCount} hint={`${inactiveCount} inactive`} />
        <AdminStatCard label="Courses authored" value={totalCourses} hint="All tutor-created courses" />
      </div>

      <AdminPanel
        title="Tutor directory"
        description="Search and manage tutor accounts. Use row actions to activate or deactivate and contact instructors."
      >
        <AdminPeopleCrmTable title="Tutors" role={UserRole.TUTOR} rows={rows} />
      </AdminPanel>
    </>
  );
}
