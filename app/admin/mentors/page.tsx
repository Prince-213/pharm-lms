import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPeopleCrmTable } from "@/components/admin/admin-people-crm-table";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export default async function AdminMentorsPage() {
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

  const rows = tutors.map((m) => {
    const courseCount = m.courses.length;
    const publishedCount = m.courses.filter((c) => c.status === CourseStatus.PUBLISHED).length;
    return {
      id: m.id,
      fullName: m.fullName,
      email: m.email,
      role: UserRole.TUTOR,
      isActive: m.isActive,
      createdAtIso: m.createdAt.toISOString(),
      primaryMetricLabel: "Courses",
      primaryMetricValue: courseCount,
      secondaryMetricLabel: "Published",
      secondaryMetricValue: publishedCount,
    };
  });

  const activeCount = tutors.filter((m) => m.isActive).length;
  const inactiveCount = tutors.length - activeCount;
  const totalCourses = tutors.reduce((sum, m) => sum + m.courses.length, 0);

  return (
    <>
      <AdminPageHeader
        title="Tutors CRM"
        description="Manage tutor accounts, production output, and publishing performance across the platform."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total tutors" value={tutors.length} hint="All tutor accounts" />
        <AdminStatCard label="Active tutors" value={activeCount} hint={`${inactiveCount} inactive`} />
        <AdminStatCard label="Courses authored" value={totalCourses} hint="All tutor-created courses" />
      </div>

      <AdminPanel
        title="Tutor directory"
        description="Search and manage tutor accounts. Use row actions to activate/deactivate, contact, and operationally track output."
      >
        <AdminPeopleCrmTable title="Tutors" role={UserRole.TUTOR} rows={rows} />
      </AdminPanel>
    </>
  );
}
