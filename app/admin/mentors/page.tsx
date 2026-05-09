import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPeopleCrmTable } from "@/components/admin/admin-people-crm-table";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export default async function AdminMentorsPage() {
  await requireAdminSession();

  const mentors = await db.user.findMany({
    where: { role: UserRole.MENTOR },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      createdAt: true,
      mentorProfileStatus: true,
      _count: {
        select: {
          meetingOwned: true,
          availability: true,
        },
      },
    },
  });

  const rows = mentors.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    email: m.email,
    role: UserRole.MENTOR,
    isActive: m.isActive,
    createdAtIso: m.createdAt.toISOString(),
    primaryMetricLabel: "Meetings",
    primaryMetricValue: m._count.meetingOwned,
    secondaryMetricLabel: "Availability",
    secondaryMetricValue: m._count.availability,
  }));

  const activeCount = mentors.filter((m) => m.isActive).length;
  const inactiveCount = mentors.length - activeCount;
  const approvedCount = mentors.filter(
    (m) => m.mentorProfileStatus === MentorProfileStatus.APPROVED,
  ).length;

  return (
    <>
      <AdminPageHeader
        title="Mentors CRM"
        description="Community mentors: profile status, meetings, and availability. Pair with Mentor applications for onboarding review."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total mentors" value={mentors.length} hint="All mentor accounts" />
        <AdminStatCard label="Active mentors" value={activeCount} hint={`${inactiveCount} inactive`} />
        <AdminStatCard
          label="Approved profiles"
          value={approvedCount}
          hint="Visible in student mentor directory"
        />
      </div>

      <AdminPanel
        title="Mentor directory"
        description="Search and manage mentor accounts. Use row actions to activate or deactivate and contact mentors."
      >
        <AdminPeopleCrmTable title="Mentors" role={UserRole.MENTOR} rows={rows} />
      </AdminPanel>
    </>
  );
}
