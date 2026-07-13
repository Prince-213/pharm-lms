import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingsCrmClient } from "@/components/meetings/meetings-crm-client";
import { RouterRefreshInterval } from "@/components/system/router-refresh-interval";
import { Card, CardContent } from "@/components/ui/card";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import { buildStudentCalendarEvents } from "@/lib/meetings/calendar-events";
import { reconcileStaleMeetingsThrottled } from "@/lib/meetings/reconcile-stale-meetings";
import { studentMeetingHubKpis } from "@/lib/meetings/student-meeting-request-status";
import { roleHomePath } from "@/lib/rbac";

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
  const calendarEvents = buildStudentCalendarEvents(meetingRequests, nowMs);

  return (
    <div className="space-y-8 text-[var(--foreground)]">
      <RouterRefreshInterval intervalMs={20000} />
      {/* <StudentSecondaryNav /> */}

      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Meetings
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Pending
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {kpis.pending}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-[var(--shadow-sm)]">
          <CardContent className="px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Upcoming
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {kpis.upcoming}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-[var(--shadow-sm)]">
          <CardContent className="px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Active
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {kpis.active}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-[var(--shadow-sm)]">
          <CardContent className="px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Joined
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {kpis.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      {calendarEvents.length > 0 ? (
        <MeetingsCrmClient events={calendarEvents} role="student" />
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-muted-foreground">
          <p>
            No meeting activity yet. When you book from Tutors or Mentors,
            requests and scheduled sessions appear on the calendar.
          </p>
        </div>
      )}

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
