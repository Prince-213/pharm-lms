import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminPeopleCrmTable } from "@/components/admin/admin-people-crm-table";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { resolveMentorAccountDisplayStatus } from "@/lib/auth/mentor-account-status";
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

  const rows = mentors.map((m) => {
    const mentorAccountStatus = resolveMentorAccountDisplayStatus({
      isActive: m.isActive,
      mentorProfileStatus: m.mentorProfileStatus,
    });
    return {
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
      mentorAccountStatus,
      mentorProfileStatus: m.mentorProfileStatus,
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
    };
  });

  const activeCount = mentors.filter(
    (m) =>
      m.isActive && m.mentorProfileStatus === MentorProfileStatus.APPROVED,
  ).length;
  const pendingActivationCount = mentors.filter(
    (m) =>
      m.isActive &&
      m.mentorProfileStatus === MentorProfileStatus.PENDING_REVIEW,
  ).length;
  const incompleteCount = mentors.filter(
    (m) =>
      m.isActive &&
      m.mentorProfileStatus === MentorProfileStatus.INCOMPLETE,
  ).length;

  return (
    <>
      <AdminPageHeader
        title="Mentors CRM"
        description="Review submitted mentor profiles, activate listings for students, and manage account access. Pending activation means the mentor finished setup and is waiting for your approval."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <AdminStatCard label="Total mentors" value={mentors.length} hint="All mentor accounts" />
        <AdminStatCard
          label="Active mentors"
          value={activeCount}
          hint="Approved and listed for students"
        />
        <AdminStatCard
          label="Pending activation"
          value={pendingActivationCount}
          hint="Submitted profiles awaiting approval"
        />
        <AdminStatCard
          label="Setup incomplete"
          value={incompleteCount}
          hint="Have not submitted for review yet"
        />
      </div>

      <AdminPanel
        title="Mentor directory"
        description="Filter by Pending activation to approve mentors. Activate marks them approved and visible in the student directory."
      >
        <AdminPeopleCrmTable title="Mentors" role={UserRole.MENTOR} rows={rows} />
      </AdminPanel>
    </>
  );
}
