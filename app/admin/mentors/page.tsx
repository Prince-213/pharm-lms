import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPeopleCrmTable } from "@/components/admin/admin-people-crm-table";
import { UserRole } from "@/generated/prisma/enums";
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
      mentorHeadline: true,
      mentorSpecialties: true,
      mentorYearsExperience: true,
      phoneNumber: true,
      country: true,
      state: true,
      city: true,
      addressLine1: true,
      addressLine2: true,
      postalCode: true,
      websiteUrl: true,
      linkedinUrl: true,
      bio: true,
      avatarUrl: true,
      mentorProfileSubmittedAt: true,
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
    mentorProfile: {
      mentorHeadline: m.mentorHeadline,
      mentorSpecialties: m.mentorSpecialties,
      mentorYearsExperience: m.mentorYearsExperience,
      phoneNumber: m.phoneNumber,
      country: m.country,
      state: m.state,
      city: m.city,
      addressLine1: m.addressLine1,
      addressLine2: m.addressLine2,
      postalCode: m.postalCode,
      websiteUrl: m.websiteUrl,
      linkedinUrl: m.linkedinUrl,
      bio: m.bio,
      avatarUrl: m.avatarUrl,
      mentorProfileSubmittedAtIso: m.mentorProfileSubmittedAt
        ? m.mentorProfileSubmittedAt.toISOString()
        : null,
    },
  }));

  const activeCount = mentors.filter((m) => m.isActive).length;
  const inactiveCount = mentors.length - activeCount;
  const pendingSubmissionsCount = mentors.filter(
    (m) => !m.isActive && m.mentorProfileSubmittedAt,
  ).length;

  return (
    <>
      <AdminPageHeader
        title="Mentors CRM"
        description="Community mentors: submitted profiles, meetings, and availability. Activate mentors to make them visible to students."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total mentors" value={mentors.length} hint="All mentor accounts" />
        <AdminStatCard label="Active mentors" value={activeCount} hint={`${inactiveCount} inactive`} />
        <AdminStatCard
          label="Pending activation"
          value={pendingSubmissionsCount}
          hint="Submitted profiles awaiting activation"
        />
      </div>

      <AdminPanel
        title="Mentor directory"
        description="Search and manage mentor accounts. Review submitted profile details, then activate/deactivate/delete as needed."
      >
        <AdminPeopleCrmTable title="Mentors" role={UserRole.MENTOR} rows={rows} />
      </AdminPanel>
    </>
  );
}
