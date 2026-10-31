import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { isJobsBoardLive } from "@/lib/jobs/constants";
import {
  getRankedJobsForStudent,
  loadStudentRankContext,
} from "@/lib/jobs/listing";
import { isStudentProfileComplete } from "@/lib/jobs/profile-complete";
import { roleHomePath } from "@/lib/rbac";
import { JobsLockPanel } from "./jobs-lock-panel";
import { JobsPageClient } from "./jobs-page-client";

type SearchParams = {
  onboard?: string;
};

export default async function StudentJobsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/student/login?callbackUrl=/student/jobs");
  }
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const params = (await searchParams) ?? {};
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      fullName: true,
      country: true,
      city: true,
      jobPreference: true,
    },
  });
  if (!user) redirect("/student/login");

  if (!isStudentProfileComplete(user)) {
    return <JobsLockPanel />;
  }

  const prefs = user.jobPreference ?? {
    roles: [] as string[],
    workStyle: null,
    level: null,
    jobAlertsEnabled: true,
    onboardingStatus: "PENDING" as const,
  };

  const live = isJobsBoardLive();
  const startOnboarding =
    prefs.onboardingStatus === "PENDING" || params.onboard === "1";

  const jobs = live
    ? await getRankedJobsForStudent(
        await loadStudentRankContext(session.user.id),
      )
    : [];
  const emailed = live
    ? await db.jobAlertDelivery.findMany({
        where: { userId: session.user.id },
        select: { jobId: true },
      })
    : [];

  return (
    <JobsPageClient
      live={live}
      startOnboarding={startOnboarding}
      emailedJobIds={emailed.map((row) => row.jobId)}
      prefs={{
        roles: prefs.roles,
        workStyle: prefs.workStyle,
        level: prefs.level,
        jobAlertsEnabled: prefs.jobAlertsEnabled,
        onboardingStatus: prefs.onboardingStatus,
      }}
      jobs={jobs.map(
        ({
          id,
          title,
          snippet,
          location,
          remote,
          company,
          source,
          type,
          salaryText,
          applyUrl,
        }) => ({
          id,
          title,
          snippet,
          location,
          remote,
          company,
          source,
          type,
          salaryText,
          applyUrl,
        }),
      )}
    />
  );
}
