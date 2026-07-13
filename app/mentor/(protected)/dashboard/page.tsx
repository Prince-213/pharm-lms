import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MentorDashboardOverview } from "@/components/mentor/dashboard/mentor-dashboard-overview";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { getMentorOverviewSnapshot } from "@/lib/mentor/dashboard-overview-data";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login");
  if (session.user.role !== UserRole.MENTOR)
    redirect(roleHomePath(session.user.role));

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true, mentorProfileStatus: true },
  });
  if (!user) redirect("/mentor/login");

  const snapshot = await getMentorOverviewSnapshot(session.user.id);
  const mentorFirstName = user.fullName?.trim().split(/\s+/)[0] ?? "";

  return (
    <MentorDashboardOverview
      mentorFirstName={mentorFirstName}
      mentorProfileStatus={user.mentorProfileStatus}
      snapshot={snapshot}
    />
  );
}
