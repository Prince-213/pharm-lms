import { Inbox, User, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingRequestActions } from "@/components/meetings/meeting-request-actions";
import { MentorMeetingsAvailabilityCallout } from "@/components/mentor/mentor-meetings-availability";
import {
  MeetingStatus,
  UserRole,
} from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import { formatMeetingCrmDate } from "@/lib/meetings/crm-display";
import { isMeetingJoinable } from "@/lib/meetings/meeting-joinable";
import { reconcileStaleMeetingsThrottled } from "@/lib/meetings/reconcile-stale-meetings";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorMeetingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login?callbackUrl=/mentor/meetings");
  if (session.user.role !== UserRole.MENTOR)
    redirect(roleHomePath(session.user.role));

  const mentor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, fullName: true },
  });
  if (!mentor) redirect("/mentor/login");

  await reconcileStaleMeetingsThrottled();

  const [requests, meetings] = await withDbRetry(async () => {
    const requests = await db.meetingRequest.findMany({
      where: { mentorId: session.user.id, courseId: null },
      orderBy: { requestedAt: "desc" },
      include: {
        student: { select: { fullName: true, email: true } },
      },
      take: 50,
    });
    const meetings = await db.meeting.findMany({
      where: { mentorId: session.user.id },
      orderBy: { startsAt: "desc" },
      include: {
        student: { select: { fullName: true } },
        meetingRequest: { select: { requestedAt: true } },
      },
      take: 50,
    });
    return [requests, meetings] as const;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10 text-[var(--foreground)]">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Meetings
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Set your weekly schedule, respond to coaching requests, and join Jitsi
          sessions.
        </p>
      </div>

      {!mentor.isActive ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Pending activation</p>
          <p className="mt-1 text-xs">
            Students can’t book you yet. Complete and submit your profile so an admin can activate your account.
          </p>
          <p className="mt-2 text-xs">
            <Link href="/mentor/profile" className="font-semibold underline">
              Go to profile
            </Link>
          </p>
        </section>
      ) : null}

      <MentorMeetingsAvailabilityCallout />

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-[var(--muted)]" />
            <h2 className="text-lg font-bold">Booking requests</h2>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Student
                  </span>
                </th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Preferred slot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length ? (
                requests.map((req) => (
                  <tr key={req.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">
                        {req.student.fullName}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {req.student.email}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--muted)]">
                      {formatMeetingCrmDate(req.requestedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {req.preferredTime
                        ? formatMeetingCrmDate(req.preferredTime)
                        : "Flexible / ASAP"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === "PENDING" ? (
                        <MeetingRequestActions
                          meetingRequestId={req.id}
                          preferredTime={req.preferredTime}
                        />
                      ) : (
                        <span className="text-xs text-[var(--muted)]">
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-[var(--muted)]"
                  >
                    <p className="font-semibold text-[var(--foreground)]">
                      No meeting requests
                    </p>
                    <p className="mt-1 text-xs">
                      When a student books you from the coach directory,
                      requests appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ul className="space-y-3 md:hidden">
          {requests.length ? (
            requests.map((req) => (
              <li
                key={req.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
              >
                <p className="font-semibold">{req.student.fullName}</p>
                <p className="text-xs text-[var(--muted)]">
                  {req.student.email}
                </p>
                <p className="mt-2 text-[11px] text-[var(--muted)]">
                  Submitted: {formatMeetingCrmDate(req.requestedAt)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Preferred:{" "}
                  {req.preferredTime
                    ? formatMeetingCrmDate(req.preferredTime)
                    : "Flexible / ASAP"}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-[var(--muted)]">
                  {req.status}
                </p>
                {req.status === "PENDING" ? (
                  <div className="mt-3 flex justify-end">
                    <MeetingRequestActions
                      meetingRequestId={req.id}
                      preferredTime={req.preferredTime}
                    />
                  </div>
                ) : null}
              </li>
            ))
          ) : (
            <li className="rounded-lg border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
              No requests yet.
            </li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Sessions</h2>
        <div className="grid gap-3">
          {meetings.length ? (
            meetings.map((meeting) => {
              const now = Date.now();
              const starts = new Date(meeting.startsAt).getTime();
              const statusLabel =
                meeting.status === MeetingStatus.COMPLETED
                  ? "Joined"
                  : meeting.status === MeetingStatus.EXPIRED
                    ? "Expired"
                    : meeting.status === MeetingStatus.CANCELLED
                      ? "Cancelled"
                      : meeting.status === MeetingStatus.SCHEDULED &&
                          starts > now
                        ? "Upcoming"
                        : meeting.status === MeetingStatus.SCHEDULED &&
                            isMeetingJoinable(meeting)
                          ? "Active"
                          : "Ended";
              return (
                <article
                  key={meeting.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Coaching session
                    </p>
                    <p className="text-xs text-[var(--foreground)]">
                      {meeting.student.fullName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                      Scheduled: {formatMeetingCrmDate(meeting.startsAt)}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      Submitted:{" "}
                      {formatMeetingCrmDate(meeting.meetingRequest.requestedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
                      {statusLabel}
                    </span>
                    {isMeetingJoinable(meeting) ? (
                      <Link
                        href={`/mentor/meetings/join/${meeting.id}`}
                        className="inline-flex items-center gap-1 rounded bg-[var(--primary)] px-2.5 py-1 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-strong)]"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join
                      </Link>
                    ) : (
                      <span className="text-[11px] font-semibold text-[var(--muted)]">
                        Join closed
                      </span>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
              <p>No sessions yet.</p>
              <p className="mt-1 text-xs">
                Accept a request to schedule your first call.
              </p>
            </div>
          )}
        </div>
      </section>

      <div>
        <Link
          href="/mentor/dashboard"
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Back to dashboard →
        </Link>
      </div>
    </div>
  );
}
