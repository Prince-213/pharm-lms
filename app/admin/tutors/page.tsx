import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPeopleCrmTable } from "@/components/admin/admin-people-crm-table";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { resolveTutorAccountDisplayStatus } from "@/lib/auth/tutor-profile-completion";
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
      tutorProfileCompletedAt: true,
      courses: { select: { status: true } },
    },
  });

  const rows = tutors.map((t) => {
    const courseCount = t.courses.length;
    const publishedCount = t.courses.filter(
      (c) => c.status === CourseStatus.PUBLISHED,
    ).length;
    const tutorAccountStatus = resolveTutorAccountDisplayStatus({
      isActive: t.isActive,
      tutorProfileCompletedAt: t.tutorProfileCompletedAt,
    });
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
      tutorAccountStatus,
      tutorProfileCompletedAtIso: t.tutorProfileCompletedAt
        ? t.tutorProfileCompletedAt.toISOString()
        : null,
    };
  });

  const activeCount = tutors.filter(
    (t) => t.isActive && t.tutorProfileCompletedAt,
  ).length;
  const incompleteCount = tutors.filter(
    (t) => t.isActive && !t.tutorProfileCompletedAt,
  ).length;
  const inactiveCount = tutors.filter((t) => !t.isActive).length;
  const totalCourses = tutors.reduce((sum, t) => sum + t.courses.length, 0);

  return (
    <>
      <AdminPageHeader
        title="Tutors CRM"
        description="Manage course creator accounts. Tutors auto-activate once their profile is fully set — no admin approval step."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total tutors" value={tutors.length} hint="All tutor accounts" />
        <AdminStatCard
          label="Active tutors"
          value={activeCount}
          hint="Profile complete and listed"
        />
        <AdminStatCard
          label="Setup incomplete"
          value={incompleteCount}
          hint={`${inactiveCount} deactivated`}
        />
        <AdminStatCard label="Courses authored" value={totalCourses} hint="All tutor-created courses" />
      </div>

      <AdminPanel
        title="Tutor directory"
        description="Search and manage tutor accounts. Setup incomplete means required profile fields are not finished yet."
      >
        <AdminPeopleCrmTable title="Tutors" role={UserRole.TUTOR} rows={rows} />
      </AdminPanel>
    </>
  );
}
