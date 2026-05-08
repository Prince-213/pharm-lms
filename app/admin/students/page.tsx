import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPeopleCrmTable } from "@/components/admin/admin-people-crm-table";
import { UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export default async function AdminStudentsPage() {
  await requireAdminSession();

  const students = await db.user.findMany({
    where: { role: UserRole.STUDENT },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      createdAt: true,
      _count: { select: { enrollments: true, achievements: true } },
    },
  });

  const rows = students.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    email: s.email,
    role: UserRole.STUDENT,
    isActive: s.isActive,
    createdAtIso: s.createdAt.toISOString(),
    primaryMetricLabel: "Enrollments",
    primaryMetricValue: s._count.enrollments,
    secondaryMetricLabel: "Badges",
    secondaryMetricValue: s._count.achievements,
  }));

  const activeCount = students.filter((s) => s.isActive).length;
  const inactiveCount = students.length - activeCount;
  const totalEnrollments = students.reduce((sum, s) => sum + s._count.enrollments, 0);

  return (
    <>
      <AdminPageHeader
        title="Students CRM"
        description="Track learner accounts, enrollment footprint, and account status. Search and manage the full student base like an operations-grade CRM."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total students" value={students.length} hint="All learner accounts" />
        <AdminStatCard label="Active students" value={activeCount} hint={`${inactiveCount} inactive`} />
        <AdminStatCard label="Total enrollments" value={totalEnrollments} hint="Across the full student base" />
      </div>

      <AdminPanel
        title="Student directory"
        description="Search, filter, and manage student accounts. Use row actions to activate/deactivate and contact learners."
      >
        <AdminPeopleCrmTable title="Students" role={UserRole.STUDENT} rows={rows} />
      </AdminPanel>
    </>
  );
}
