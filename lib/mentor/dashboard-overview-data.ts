import { MeetingRequestStatus, MeetingStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/db-retry";
import { formatMeetingCrmDate } from "@/lib/meetings/crm-display";
import { reconcileStaleMeetingsThrottled } from "@/lib/meetings/reconcile-stale-meetings";

const WEEKDAY_SHORT = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export type MentorUpcomingMeetingRow = {
  id: string;
  studentName: string;
  startsAt: Date;
  endsAt: Date | null;
  status: MeetingStatus;
};

export type MentorActivityRow = {
  id: string;
  kind: "request" | "session";
  occurredAt: Date;
  title: string;
  detail: string;
  statusLabel: string;
};

export type MentorOverviewSnapshot = {
  pendingRequestCount: number;
  upcomingWeekSessionCount: number;
  availabilitySlotCount: number;
  availabilitySummaryLine: string | null;
  availabilityTimezone: string | null;
  upcomingMeetings: MentorUpcomingMeetingRow[];
  activity: MentorActivityRow[];
};

function summarizeAvailability(
  slots: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
  }[],
): { line: string | null; timezone: string | null } {
  if (!slots.length) return { line: null, timezone: null };
  const tz = slots[0]?.timezone ?? null;
  const sameWindow = slots.every(
    (s) => s.startTime === slots[0].startTime && s.endTime === slots[0].endTime,
  );
  const sameTz = slots.every((s) => s.timezone === slots[0].timezone);
  const days = [...new Set(slots.map((s) => s.dayOfWeek))].sort(
    (a, b) => a - b,
  );
  const dayLabels = days
    .map((d) => WEEKDAY_SHORT[d] ?? `D${d}`)
    .filter(Boolean);

  let dayPart: string;
  if (dayLabels.length === 7) {
    dayPart = "Every day";
  } else if (
    dayLabels.length === 5 &&
    days[0] === 0 &&
    days[4] === 4 &&
    days.every((d, i) => d === i)
  ) {
    dayPart = "Mon–Fri";
  } else if (dayLabels.length <= 3) {
    dayPart = dayLabels.join(", ");
  } else {
    dayPart = `${slots.length} weekly blocks`;
  }

  if (sameWindow && sameTz) {
    return {
      line: `${dayPart} · ${slots[0].startTime}–${slots[0].endTime}`,
      timezone: tz,
    };
  }
  return {
    line: `${slots.length} weekly blocks`,
    timezone: sameTz ? tz : null,
  };
}

export async function getMentorOverviewSnapshot(
  mentorId: string,
): Promise<MentorOverviewSnapshot> {
  await reconcileStaleMeetingsThrottled();

  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return withDbRetry(async () => {
    const [
      pendingRequestCount,
      upcomingWeekSessionCount,
      availabilitySlots,
      upcomingMeetingsRaw,
      recentRequests,
      recentMeetings,
    ] = await Promise.all([
      db.meetingRequest.count({
        where: {
          mentorId,
          courseId: null,
          status: MeetingRequestStatus.PENDING,
        },
      }),
      db.meeting.count({
        where: {
          mentorId,
          status: MeetingStatus.SCHEDULED,
          startsAt: { gte: now, lte: weekEnd },
        },
      }),
      db.mentorAvailability.findMany({
        where: { mentorId },
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          timezone: true,
        },
      }),
      db.meeting.findMany({
        where: {
          mentorId,
          status: MeetingStatus.SCHEDULED,
          startsAt: { gte: now },
        },
        orderBy: { startsAt: "asc" },
        take: 5,
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          status: true,
          student: { select: { fullName: true } },
        },
      }),
      db.meetingRequest.findMany({
        where: { mentorId, courseId: null },
        orderBy: { requestedAt: "desc" },
        take: 12,
        select: {
          id: true,
          requestedAt: true,
          status: true,
          student: { select: { fullName: true } },
        },
      }),
      db.meeting.findMany({
        where: { mentorId },
        orderBy: { startsAt: "desc" },
        take: 12,
        select: {
          id: true,
          startsAt: true,
          status: true,
          student: { select: { fullName: true } },
        },
      }),
    ]);

    const { line: availabilitySummaryLine, timezone: availabilityTimezone } =
      summarizeAvailability(availabilitySlots);

    const upcomingMeetings: MentorUpcomingMeetingRow[] =
      upcomingMeetingsRaw.map((m) => ({
        id: m.id,
        studentName: m.student.fullName,
        startsAt: m.startsAt,
        endsAt: m.endsAt,
        status: m.status,
      }));

    const activityParts: MentorActivityRow[] = [];

    for (const r of recentRequests) {
      activityParts.push({
        id: `req-${r.id}`,
        kind: "request",
        occurredAt: r.requestedAt,
        title: `Booking request · ${r.student.fullName}`,
        detail: formatMeetingCrmDate(r.requestedAt),
        statusLabel: r.status,
      });
    }

    for (const m of recentMeetings) {
      activityParts.push({
        id: `mtg-${m.id}`,
        kind: "session",
        occurredAt: m.startsAt,
        title: `Session · ${m.student.fullName}`,
        detail: formatMeetingCrmDate(m.startsAt),
        statusLabel: m.status,
      });
    }

    activityParts.sort(
      (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
    );
    const activity = activityParts.slice(0, 8);

    return {
      pendingRequestCount,
      upcomingWeekSessionCount,
      availabilitySlotCount: availabilitySlots.length,
      availabilitySummaryLine,
      availabilityTimezone,
      upcomingMeetings,
      activity,
    };
  });
}
