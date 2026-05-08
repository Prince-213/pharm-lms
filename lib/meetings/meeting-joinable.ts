import { MeetingStatus } from "@/generated/prisma/enums";
import { meetingSessionMaxMs } from "@/lib/meetings/session-window";

type MeetingLike = {
  status: MeetingStatus;
  startsAt: Date;
  endsAt: Date | null;
};

/** True if the join link should still be offered (SCHEDULED and inside the assumed session window). */
export function isMeetingJoinable(
  meeting: MeetingLike,
  nowMs = Date.now(),
): boolean {
  if (meeting.status !== MeetingStatus.SCHEDULED) return false;
  const starts = new Date(meeting.startsAt).getTime();
  const windowEnd = starts + meetingSessionMaxMs();
  if (nowMs > windowEnd) return false;
  if (meeting.endsAt) {
    const ends = new Date(meeting.endsAt).getTime();
    if (ends < nowMs) return false;
  }
  return true;
}

/** True for CRM “live session” counts (started, not ended, still SCHEDULED, inside window). */
export function isMeetingLiveForDashboard(
  meeting: MeetingLike,
  nowMs = Date.now(),
): boolean {
  if (meeting.status !== MeetingStatus.SCHEDULED) return false;
  const starts = new Date(meeting.startsAt).getTime();
  const windowEnd = starts + meetingSessionMaxMs();
  if (nowMs > windowEnd) return false;
  if (starts > nowMs) return false;
  if (meeting.endsAt) {
    const ends = new Date(meeting.endsAt).getTime();
    if (ends < nowMs) return false;
  }
  return true;
}
