import type { Meeting } from "@/generated/prisma/client";
import { MeetingRequestStatus } from "@/generated/prisma/enums";
import { isMeetingLiveForDashboard } from "@/lib/meetings/meeting-joinable";

export type StudentMeetingRequestRow = {
  status: MeetingRequestStatus;
  meeting: Meeting | null;
};

export function studentMeetingRowStatus(
  req: StudentMeetingRequestRow,
  nowMs: number,
): string {
  const meeting = req.meeting;
  const startsAt = meeting?.startsAt
    ? new Date(meeting.startsAt).getTime()
    : null;
  if (!meeting) {
    if (req.status === MeetingRequestStatus.PENDING) return "Pending";
    if (req.status === MeetingRequestStatus.REJECTED) return "Rejected";
    return "Requested";
  }
  if (meeting.status === "EXPIRED") return "Expired";
  if (meeting.status === "COMPLETED") return "Joined";
  if (meeting.status === "CANCELLED") return "Cancelled";
  if (meeting.status === "SCHEDULED" && startsAt !== null && startsAt > nowMs) {
    return "Upcoming";
  }
  if (meeting.status === "SCHEDULED" && isMeetingLiveForDashboard(meeting)) {
    return "Active";
  }
  return "Ended";
}

export function studentMeetingHubKpis(
  requests: StudentMeetingRequestRow[],
  nowMs: number,
) {
  let pending = 0;
  let upcoming = 0;
  let active = 0;
  let completed = 0;

  for (const req of requests) {
    if (req.status === MeetingRequestStatus.PENDING) pending += 1;

    const meeting = req.meeting;
    const startsAt = meeting?.startsAt
      ? new Date(meeting.startsAt).getTime()
      : null;

    if (
      meeting?.status === "SCHEDULED" &&
      startsAt !== null &&
      startsAt > nowMs
    ) {
      upcoming += 1;
    }
    if (meeting && isMeetingLiveForDashboard(meeting)) {
      active += 1;
    }
    if (meeting?.status === "COMPLETED") {
      completed += 1;
    }
  }

  return { pending, upcoming, active, completed, total: requests.length };
}
