import { Inbox, User, Video } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingRequestActions } from "@/components/meetings/meeting-request-actions";
import { MentorMeetingsAvailabilityCallout } from "@/components/mentor/mentor-meetings-availability";
import { MeetingStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import {
  enrollmentsByStudentId,
  formatEnrolledCoursesLine,
  formatMeetingCrmDate,
} from "@/lib/meetings/crm-display";
import { isMeetingJoinable } from "@/lib/meetings/meeting-joinable";
import { reconcileStaleMeetingsThrottled } from "@/lib/meetings/reconcile-stale-meetings";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorCommunicationMeetingsPage() {
  const session = await auth();
  if (!session?.user)
    redirect("/tutor/login?callbackUrl=/tutor/communication/meetings");
  if (session.user.role !== UserRole.TUTOR)
    redirect(roleHomePath(session.user.role));

  await reconcileStaleMeetingsThrottled();

  const [requests, meetings, enrollmentRows] = await withDbRetry(async () => {
    const requests = await db.meetingRequest.findMany({
      where: { mentorId: session.user.id, courseId: { not: null } },
      orderBy: { requestedAt: "desc" },
      include: {
        student: { select: { fullName: true } },
        course: { select: { title: true } },
      },
      take: 50,
    });
    const studentIds = [...new Set(requests.map((r) => r.studentId))];
    const enrollmentRows =
      studentIds.length > 0
        ? await db.enrollment.findMany({
            where: {
              studentId: { in: studentIds },
              course: { mentorId: session.user.id },
            },
            select: {
              studentId: true,
              course: { select: { id: true, title: true } },
            },
          })
        : [];
    const meetings = await db.meeting.findMany({
      where: { mentorId: session.user.id },
      orderBy: { startsAt: "desc" },
      include: {
        student: { select: { fullName: true } },
        meetingRequest: {
          select: {
            requestedAt: true,
            course: { select: { title: true } },
          },
        },
      },
      take: 50,
    });
    return [requests, meetings, enrollmentRows] as const;
  });

  const enrollmentsMap = enrollmentsByStudentId(enrollmentRows);

  return (
    <div className="px-5 py-6 text-[var(--foreground)] sm:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Meetings</h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Set your weekly availability, then review and respond to student
          booking requests from one place.
        </p>
      </div>

      <MentorMeetingsAvailabilityCallout />

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-[var(--muted)]" />
            <h3 className="text-lg font-bold">Meeting requests</h3>
          </div>
        </div>

        <div className="overflow-hidden rounded border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Student
                  </span>
                </th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Preferred slot</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length ? (
                requests.map((req) => {
                  const enrolledLine = formatEnrolledCoursesLine(
                    enrollmentsMap.get(req.studentId) ?? [],
                  );
                  return (
                    <tr
                      key={req.id}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--foreground)]">
                          {req.student.fullName}
                        </p>
                        {enrolledLine ? (
                          <p className="mt-1 line-clamp-2 text-[11px] text-[var(--muted)]">
                            {enrolledLine}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--muted)]">
                        {formatMeetingCrmDate(req.requestedAt)}
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {req.course?.title ?? "Course"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)]">
                        {req.preferredTime
                          ? formatMeetingCrmDate(req.preferredTime)
                          : "—"}
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
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-[var(--muted)]"
                  >
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-muted)]">
                      <Inbox
                        className="h-7 w-7 text-[var(--muted)]"
                        strokeWidth={1.25}
                      />
                    </div>
                    <p className="font-semibold text-[var(--foreground)]">
                      No meeting requests
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Students can book once they are enrolled in your courses
                      and you set availability.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="mb-3 text-lg font-bold">Meeting sessions</h3>
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
                  className="flex flex-wrap items-center justify-between gap-3 rounded border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {meeting.meetingRequest.course?.title ?? "Course"}
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
                      <a
                        href={`/tutor/communication/meetings/join/${meeting.id}`}
                        className="inline-flex items-center gap-1 rounded bg-[var(--primary)] px-2.5 py-1 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-strong)]"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join
                      </a>
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
            <div className="rounded border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
              <p>No sessions yet.</p>
              <p className="mt-1 text-xs">
                Accept a pending request to create your first meeting session.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
