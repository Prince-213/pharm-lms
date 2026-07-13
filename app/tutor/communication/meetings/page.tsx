import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingsCrmClient } from "@/components/meetings/meetings-crm-client";
import { MentorMeetingsAvailabilityCallout } from "@/components/mentor/mentor-meetings-availability";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import {
  availableWeekdaysFromAvailability,
  buildHostCalendarEvents,
} from "@/lib/meetings/calendar-events";
import {
  enrollmentsByStudentId,
  formatEnrolledCoursesLine,
} from "@/lib/meetings/crm-display";
import { reconcileStaleMeetingsThrottled } from "@/lib/meetings/reconcile-stale-meetings";
import { notifyLateOrMissedMeetings } from "@/lib/notifications/meeting-events";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorCommunicationMeetingsPage() {
  const session = await auth();
  if (!session?.user)
    redirect("/tutor/login?callbackUrl=/tutor/communication/meetings");
  if (session.user.role !== UserRole.TUTOR)
    redirect(roleHomePath(session.user.role));

  await reconcileStaleMeetingsThrottled();
  void notifyLateOrMissedMeetings(session.user.id);

  const [requests, meetings, enrollmentRows, availability] =
    await withDbRetry(async () => {
    const requests = await db.meetingRequest.findMany({
      where: { mentorId: session.user.id, courseId: { not: null } },
      orderBy: { requestedAt: "desc" },
      include: {
        student: { select: { fullName: true, email: true } },
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
    const availability = await db.mentorAvailability.findMany({
      where: { mentorId: session.user.id, isRecurring: true },
      select: { dayOfWeek: true },
    });
    return [requests, meetings, enrollmentRows, availability] as const;
  });

  const enrollmentsMap = enrollmentsByStudentId(enrollmentRows);
  const enrolledLinesByStudentId = new Map<string, string | null>();
  for (const [studentId, courses] of enrollmentsMap) {
    enrolledLinesByStudentId.set(
      studentId,
      formatEnrolledCoursesLine(courses),
    );
  }

  const nowMs = Date.now();
  const calendarEvents = buildHostCalendarEvents(
    requests.map((r) => ({
      ...r,
      studentId: r.studentId,
      student: { fullName: r.student.fullName, email: r.student.email },
    })),
    meetings.map((m) => ({
      ...m,
      meetingRequestId: m.meetingRequestId,
    })),
    enrolledLinesByStudentId,
    "/tutor/communication/meetings/join",
    nowMs,
  );
  const availableWeekdays =
    availableWeekdaysFromAvailability(availability);

  return (
    <div className="px-5 py-6 text-[var(--foreground)] sm:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Meetings</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Set your weekly availability, then review and respond to student
          booking requests from one place.
        </p>
      </div>

      <MentorMeetingsAvailabilityCallout />

      <section className="mt-6">
        <p className="mb-3 text-sm text-muted-foreground">
          Click a day or event to review requests, accept bookings, or join a
          session.
        </p>
        {calendarEvents.length > 0 ? (
          <MeetingsCrmClient
            events={calendarEvents}
            role="host"
            availableWeekdays={availableWeekdays}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-[var(--foreground)]">
              No meeting activity yet
            </p>
            <p className="mt-1 text-xs">
              Students can book once they are enrolled in your courses and you
              set availability.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
