import {
  MeetingRequestStatus,
  MeetingStatus,
  UserRole,
} from "@/generated/prisma/enums";
import type { Meeting } from "@/generated/prisma/client";
import { formatMeetingCrmDate } from "@/lib/meetings/crm-display";
import { isMeetingJoinable } from "@/lib/meetings/meeting-joinable";
import { mondayZeroFromDate } from "@/lib/meetings/mentor-availability-helpers";
import { studentMeetingRowStatus } from "@/lib/meetings/student-meeting-request-status";

export type CalendarEventKind =
  | "pending_request"
  | "scheduled"
  | "active"
  | "completed"
  | "rejected"
  | "cancelled";

export type CalendarEvent = {
  id: string;
  dateKey: string;
  kind: CalendarEventKind;
  label: string;
  shortLabel: string;
  meetingRequestId: string;
  meetingId: string | null;
  requestStatus: MeetingRequestStatus;
  displayStatus: string;
  submittedAt: string;
  preferredTime: string | null;
  scheduledAt: string | null;
  message: string | null;
  courseTitle: string | null;
  counterpartyName: string;
  counterpartyId: string | null;
  counterpartyEmail: string | null;
  counterpartyRole: UserRole | null;
  enrolledCoursesLine: string | null;
  joinUrl: string | null;
  joinable: boolean;
  joinHref: string | null;
  canAcceptReject: boolean;
};

export function dateKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const mo = `${d.getMonth() + 1}`.padStart(2, "0");
  const da = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function kindFromStudentStatus(
  displayStatus: string,
  requestStatus: MeetingRequestStatus,
): CalendarEventKind {
  if (requestStatus === MeetingRequestStatus.REJECTED) return "rejected";
  if (requestStatus === MeetingRequestStatus.CANCELLED) return "cancelled";
  if (displayStatus === "Pending") return "pending_request";
  if (displayStatus === "Upcoming") return "scheduled";
  if (displayStatus === "Active") return "active";
  if (displayStatus === "Joined") return "completed";
  return "scheduled";
}

function eventDateForRequest(
  preferredTime: Date | null,
  meetingStartsAt: Date | null | undefined,
  requestedAt: Date,
): Date {
  if (meetingStartsAt) return new Date(meetingStartsAt);
  if (preferredTime) return new Date(preferredTime);
  return new Date(requestedAt);
}

export type StudentCalendarRequest = {
  id: string;
  status: MeetingRequestStatus;
  requestedAt: Date;
  preferredTime: Date | null;
  message: string | null;
  course: { title: string } | null;
  mentor: { id: string; fullName: string; role: UserRole };
  meeting: Pick<
    Meeting,
    | "id"
    | "startsAt"
    | "joinUrl"
    | "status"
    | "openedAt"
    | "endsAt"
    | "mentorId"
    | "studentId"
    | "roomName"
    | "meetingRequestId"
  > | null;
};

export function buildStudentCalendarEvents(
  requests: StudentCalendarRequest[],
  nowMs: number,
): CalendarEvent[] {
  return requests.map((req) => {
    const displayStatus = studentMeetingRowStatus(req, nowMs);
    const kind = kindFromStudentStatus(displayStatus, req.status);
    const eventDate = eventDateForRequest(
      req.preferredTime,
      req.meeting?.startsAt,
      req.requestedAt,
    );
    const joinable = req.meeting ? isMeetingJoinable(req.meeting) : false;

    return {
      id: req.id,
      dateKey: dateKeyFromDate(eventDate),
      kind,
      label: req.course?.title ?? "Coach session",
      shortLabel:
        kind === "pending_request"
          ? "Pending"
          : kind === "active"
            ? "Join"
            : displayStatus,
      meetingRequestId: req.id,
      meetingId: req.meeting?.id ?? null,
      requestStatus: req.status,
      displayStatus,
      submittedAt: req.requestedAt.toISOString(),
      preferredTime: req.preferredTime?.toISOString() ?? null,
      scheduledAt: req.meeting?.startsAt.toISOString() ?? null,
      message: req.message,
      courseTitle: req.course?.title ?? null,
      counterpartyName: req.mentor.fullName,
      counterpartyId: req.mentor.id,
      counterpartyEmail: null,
      counterpartyRole: req.mentor.role,
      enrolledCoursesLine: null,
      joinUrl: req.meeting?.joinUrl ?? null,
      joinable,
      joinHref: req.meeting
        ? `/student/meetings/join/${req.meeting.id}`
        : null,
      canAcceptReject: false,
    };
  });
}

export type HostCalendarRequest = {
  id: string;
  status: MeetingRequestStatus;
  requestedAt: Date;
  preferredTime: Date | null;
  message: string | null;
  course: { title: string } | null;
  student: { fullName: string; email?: string | null };
};

export type HostCalendarMeeting = {
  id: string;
  startsAt: Date;
  joinUrl: string;
  status: MeetingStatus;
  openedAt: Date | null;
  endsAt: Date | null;
  meetingRequestId: string;
  student: { fullName: string };
  meetingRequest: {
    requestedAt: Date;
    course: { title: string } | null;
  };
};

export function buildHostCalendarEvents(
  requests: (HostCalendarRequest & { studentId?: string })[],
  meetings: HostCalendarMeeting[],
  enrolledLinesByStudentId: Map<string, string | null>,
  joinPathPrefix: string,
  nowMs: number,
): CalendarEvent[] {
  const meetingByRequest = new Map(
    meetings.map((m) => [m.meetingRequestId, m] as const),
  );
  const seenRequestIds = new Set<string>();
  const events: CalendarEvent[] = [];

  for (const req of requests) {
    seenRequestIds.add(req.id);
    const meeting = meetingByRequest.get(req.id);
    const eventDate = eventDateForRequest(
      req.preferredTime,
      meeting?.startsAt,
      req.requestedAt,
    );
    const joinable = meeting ? isMeetingJoinable(meeting) : false;
    let kind: CalendarEventKind = "pending_request";
    let displayStatus: string = req.status;

    if (req.status === MeetingRequestStatus.REJECTED) {
      kind = "rejected";
    } else if (req.status === MeetingRequestStatus.CANCELLED) {
      kind = "cancelled";
    } else if (meeting) {
      const starts = new Date(meeting.startsAt).getTime();
      if (meeting.status === MeetingStatus.COMPLETED) {
        kind = "completed";
        displayStatus = "Joined";
      } else if (joinable) {
        kind = "active";
        displayStatus = "Active";
      } else if (starts > nowMs) {
        kind = "scheduled";
        displayStatus = "Upcoming";
      } else {
        kind = "scheduled";
        displayStatus = "Scheduled";
      }
    }

    events.push({
      id: req.id,
      dateKey: dateKeyFromDate(eventDate),
      kind,
      label: req.student.fullName,
      shortLabel:
        kind === "pending_request"
          ? "Pending"
          : kind === "active"
            ? "Join"
            : displayStatus,
      meetingRequestId: req.id,
      meetingId: meeting?.id ?? null,
      requestStatus: req.status,
      displayStatus,
      submittedAt: req.requestedAt.toISOString(),
      preferredTime: req.preferredTime?.toISOString() ?? null,
      scheduledAt: meeting?.startsAt.toISOString() ?? null,
      message: req.message,
      courseTitle: req.course?.title ?? null,
      counterpartyName: req.student.fullName,
      counterpartyId: req.studentId ?? null,
      counterpartyEmail: req.student.email ?? null,
      counterpartyRole: UserRole.STUDENT,
      enrolledCoursesLine: req.studentId
        ? (enrolledLinesByStudentId.get(req.studentId) ?? null)
        : null,
      joinUrl: meeting?.joinUrl ?? null,
      joinable,
      joinHref: meeting ? `${joinPathPrefix}/${meeting.id}` : null,
      canAcceptReject: req.status === MeetingRequestStatus.PENDING && !meeting,
    });
  }

  for (const meeting of meetings) {
    if (seenRequestIds.has(meeting.meetingRequestId)) continue;
    const joinable = isMeetingJoinable(meeting);
    const starts = new Date(meeting.startsAt).getTime();
    events.push({
      id: meeting.meetingRequestId,
      dateKey: dateKeyFromDate(new Date(meeting.startsAt)),
      kind: joinable ? "active" : starts > nowMs ? "scheduled" : "completed",
      label: meeting.student.fullName,
      shortLabel: joinable ? "Join" : "Session",
      meetingRequestId: meeting.meetingRequestId,
      meetingId: meeting.id,
      requestStatus: MeetingRequestStatus.ACCEPTED,
      displayStatus: joinable ? "Active" : "Scheduled",
      submittedAt: meeting.meetingRequest.requestedAt.toISOString(),
      preferredTime: null,
      scheduledAt: meeting.startsAt.toISOString(),
      message: null,
      courseTitle: meeting.meetingRequest.course?.title ?? null,
      counterpartyName: meeting.student.fullName,
      counterpartyId: null,
      counterpartyEmail: null,
      counterpartyRole: UserRole.STUDENT,
      enrolledCoursesLine: null,
      joinUrl: meeting.joinUrl,
      joinable,
      joinHref: `${joinPathPrefix}/${meeting.id}`,
      canAcceptReject: false,
    });
  }

  return events;
}

export function availableWeekdaysFromAvailability(
  rows: { dayOfWeek: number }[],
): number[] {
  return [...new Set(rows.map((r) => r.dayOfWeek))].sort((a, b) => a - b);
}

export function isWeekdayAvailable(
  date: Date,
  availableWeekdays: number[],
): boolean {
  if (availableWeekdays.length === 0) return true;
  return availableWeekdays.includes(mondayZeroFromDate(date));
}

export function formatCalendarEventTime(iso: string | null): string {
  if (!iso) return "—";
  return formatMeetingCrmDate(new Date(iso));
}
