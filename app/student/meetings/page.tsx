import { CalendarClock, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { RouterRefreshInterval } from "@/components/system/router-refresh-interval";
import { Card, CardContent } from "@/components/ui/card";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import { formatMeetingCrmDate } from "@/lib/meetings/crm-display";
import { isMeetingJoinable } from "@/lib/meetings/meeting-joinable";
import { reconcileStaleMeetingsThrottled } from "@/lib/meetings/reconcile-stale-meetings";
import {
  studentMeetingHubKpis,
  studentMeetingRowStatus,
} from "@/lib/meetings/student-meeting-request-status";
import { roleHomePath } from "@/lib/rbac";
import { cn } from "@/lib/utils";

function hostRoleLabel(role: UserRole): string {
  if (role === UserRole.TUTOR) return "Tutor";
  if (role === UserRole.MENTOR) return "Mentor";
  return "Host";
}

export default async function StudentMeetingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/meetings");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  await reconcileStaleMeetingsThrottled();

  const meetingRequests = await withDbRetry(() =>
    db.meetingRequest.findMany({
      where: { studentId: session.user.id },
      orderBy: { requestedAt: "desc" },
      include: {
        course: { select: { title: true } },
        mentor: { select: { id: true, fullName: true, role: true } },
        meeting: true,
      },
    }),
  );

  const nowMs = Date.now();
  const kpis = studentMeetingHubKpis(meetingRequests, nowMs);

  return (
    <div className="space-y-8 text-[var(--foreground)]">
      <RouterRefreshInterval intervalMs={20000} />
      {/* <StudentSecondaryNav /> */}

      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Meetings
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Track requests, scheduled times, and join live sessions. To book a
          course instructor go to{" "}
          <Link
            href="/student/tutors"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Tutors
          </Link>
          ; for coaching-only sessions browse{" "}
          <Link
            href="/student/mentors"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Mentors
          </Link>
          .
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-[var(--border)] shadow-[var(--shadow-sm)]">
          <CardContent className="px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Pending
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {kpis.pending}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-[var(--shadow-sm)]">
          <CardContent className="px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Upcoming
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {kpis.upcoming}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-[var(--shadow-sm)]">
          <CardContent className="px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Active
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {kpis.active}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-[var(--shadow-sm)]">
          <CardContent className="px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Joined
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {kpis.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)]/40 px-5 py-4">
          <CalendarClock
            className="h-5 w-5 shrink-0 text-[var(--muted)]"
            strokeWidth={1.75}
          />
          <div>
            <h2 className="text-base font-semibold">Activity</h2>
            <p className="text-xs text-[var(--muted)]">
              {kpis.total} request{kpis.total === 1 ? "" : "s"} total
            </p>
          </div>
        </div>
        {meetingRequests.length ? (
          <>
            <div className="hidden md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--background)] text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Context</th>
                    <th className="px-4 py-3">Host</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {meetingRequests.map((req) => {
                    const meeting = req.meeting;
                    const status = studentMeetingRowStatus(req, nowMs);
                    return (
                      <tr
                        key={req.id}
                        className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-muted)]/40"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium leading-snug">
                            {req.course?.title ?? "Coach session"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-[var(--foreground)]">
                              {req.mentor.fullName}
                            </span>
                            <span
                              className={cn(
                                "w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                req.mentor.role === UserRole.TUTOR
                                  ? "bg-[var(--primary-soft)]/50 text-[var(--primary-strong)]"
                                  : "bg-[var(--surface-muted)] text-[var(--muted)]",
                              )}
                            >
                              {hostRoleLabel(req.mentor.role)}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--muted)]">
                          {formatMeetingCrmDate(req.requestedAt)}
                        </td>
                        <td className="max-w-[200px] px-4 py-3 text-xs leading-snug text-[var(--muted)]">
                          {meeting?.startsAt ? (
                            <>
                              Scheduled {formatMeetingCrmDate(meeting.startsAt)}
                            </>
                          ) : req.preferredTime ? (
                            <>
                              Preferred{" "}
                              {formatMeetingCrmDate(req.preferredTime)}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {meeting?.joinUrl && isMeetingJoinable(meeting) ? (
                            <Link
                              href={`/student/meetings/join/${meeting.id}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
                            >
                              <Video className="h-3.5 w-3.5" />
                              Join
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-[var(--border)] md:hidden">
              {meetingRequests.map((req) => {
                const meeting = req.meeting;
                const status = studentMeetingRowStatus(req, nowMs);
                return (
                  <li key={req.id} className="bg-[var(--surface)] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug">
                          {req.course?.title ?? "Coach session"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--foreground)]">
                          {req.mentor.fullName}
                        </p>
                        <span
                          className={cn(
                            "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            req.mentor.role === UserRole.TUTOR
                              ? "bg-[var(--primary-soft)]/50 text-[var(--primary-strong)]"
                              : "bg-[var(--surface-muted)] text-[var(--muted)]",
                          )}
                        >
                          {hostRoleLabel(req.mentor.role)}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                        {status}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-[var(--muted)]">
                      Submitted {formatMeetingCrmDate(req.requestedAt)}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {meeting?.startsAt
                        ? `Scheduled ${formatMeetingCrmDate(meeting.startsAt)}`
                        : req.preferredTime
                          ? `Preferred ${formatMeetingCrmDate(req.preferredTime)}`
                          : null}
                    </p>
                    {meeting?.joinUrl && isMeetingJoinable(meeting) ? (
                      <Link
                        href={`/student/meetings/join/${meeting.id}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]"
                      >
                        <Video className="h-4 w-4" />
                        Join meeting
                      </Link>
                    ) : !meeting?.startsAt && !req.preferredTime ? (
                      <p className="mt-2 text-[11px] text-[var(--muted)]">
                        Waiting for host.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center px-4 py-12 text-center text-sm text-[var(--muted)]">
            <CalendarClock className="h-10 w-10 text-[var(--border)]" />
            <p className="mt-3 max-w-sm">
              No meeting activity yet. When you book from Tutors or Mentors,
              requests and scheduled sessions appear here.
            </p>
          </div>
        )}
      </Card>

      <div>
        <Link
          href="/student/dashboard"
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Back to My learning
        </Link>
      </div>
    </div>
  );
}
