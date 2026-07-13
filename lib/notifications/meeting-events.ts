import { MeetingStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/notifications/email-service";
import { createNotification } from "@/lib/notifications/notification-service";

function appBaseUrl() {
  return (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
}

function meetingsHrefForRole(role: UserRole) {
  return role === UserRole.MENTOR
    ? "/mentor/meetings"
    : "/tutor/communication/meetings";
}

/**
 * In-app + email for the host when a student creates a meeting request (pending or instant).
 */
export async function notifyHostNewMeetingRequest(
  meetingRequestId: string,
): Promise<void> {
  const req = await db.meetingRequest.findUnique({
    where: { id: meetingRequestId },
    include: {
      student: { select: { fullName: true } },
      mentor: { select: { id: true, email: true, fullName: true, role: true } },
      course: { select: { title: true } },
      meeting: { select: { id: true } },
    },
  });
  if (!req) return;

  const host = req.mentor;
  const href = meetingsHrefForRole(host.role);
  const base = appBaseUrl();
  const isInstant = Boolean(req.meeting && req.status === "ACCEPTED");
  const title = isInstant
    ? `${req.student.fullName} started an instant session`
    : `${req.student.fullName} requested a meeting`;
  const bodyParts = [
    req.course?.title ? `Course: ${req.course.title}` : "Coaching session",
  ];
  if (req.preferredTime && !isInstant) {
    bodyParts.push(
      `Preferred: ${new Date(req.preferredTime).toLocaleString()}`,
    );
  }
  const body = bodyParts.join(" · ");

  await createNotification({
    userId: host.id,
    kind: isInstant ? "MEETING_INSTANT" : "MEETING_REQUEST",
    title,
    body,
    href,
  });

  const link = `${base}${href}`;
  void sendEmail({
    to: host.email,
    subject: isInstant
      ? `Instant meeting: ${req.student.fullName}`
      : `Meeting request from ${req.student.fullName}`,
    html: `<p>Hi ${host.fullName.split(/\s+/)[0] || host.fullName},</p>
<p><strong>${req.student.fullName}</strong> ${
      isInstant
        ? "started an instant video session."
        : "requested a meeting with you."
    }</p>
${req.course?.title ? `<p>Course: ${req.course.title}</p>` : ""}
${req.preferredTime && !isInstant ? `<p>Preferred time: ${new Date(req.preferredTime).toLocaleString()}</p>` : ""}
<p><a href="${link}">Open meetings in Pharm LMS</a></p>`,
  });
}

export async function notifyStudentMeetingAccepted(
  meetingRequestId: string,
): Promise<void> {
  const req = await db.meetingRequest.findUnique({
    where: { id: meetingRequestId },
    include: {
      student: { select: { id: true, email: true, fullName: true } },
      mentor: { select: { fullName: true } },
      meeting: { select: { id: true, startsAt: true } },
    },
  });
  if (!req?.meeting) return;

  const when = new Date(req.meeting.startsAt).toLocaleString();
  const href = "/student/meetings";
  const base = appBaseUrl();
  const joinPath = `/student/meetings/join/${req.meeting.id}`;
  const joinUrl = base ? `${base}${joinPath}` : joinPath;

  await createNotification({
    userId: req.student.id,
    kind: "MEETING_ACCEPTED",
    title: `Meeting confirmed with ${req.mentor.fullName}`,
    body: `Scheduled for ${when}.`,
    href,
  });

  void sendEmail({
    to: req.student.email,
    subject: `Meeting confirmed with ${req.mentor.fullName}`,
    html: `<p>Hi ${req.student.fullName.split(/\s+/)[0] || req.student.fullName},</p>
<p><strong>${req.mentor.fullName}</strong> accepted your meeting request.</p>
<p>Scheduled for: <strong>${when}</strong></p>
<p><a href="${joinUrl}">Join from Pharm LMS</a> (when the session is open)</p>
<p><a href="${base}${href}">View your meetings</a></p>`,
  });
}

export async function notifyStudentMeetingRejected(
  meetingRequestId: string,
): Promise<void> {
  const req = await db.meetingRequest.findUnique({
    where: { id: meetingRequestId },
    include: {
      student: { select: { id: true, email: true, fullName: true } },
      mentor: { select: { fullName: true } },
    },
  });
  if (!req) return;

  const href = "/student/meetings";
  const base = appBaseUrl();

  await createNotification({
    userId: req.student.id,
    kind: "MEETING_REJECTED",
    title: `Meeting request declined`,
    body: `${req.mentor.fullName} was not available for this time.`,
    href,
  });

  void sendEmail({
    to: req.student.email,
    subject: `Meeting request update`,
    html: `<p>Hi ${req.student.fullName.split(/\s+/)[0] || req.student.fullName},</p>
<p><strong>${req.mentor.fullName}</strong> declined your meeting request. You can try another time from your dashboard.</p>
<p><a href="${base}${href}">Meetings</a></p>`,
  });
}

const LATE_MEETING_KIND = "MEETING_MISSED";

/**
 * Notifies host + student when a scheduled meeting passed without anyone joining.
 * Safe to call on page load (deduped by notification kind + meeting id in title).
 */
export async function notifyLateOrMissedMeetings(
  mentorId: string,
): Promise<void> {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const stale = await db.meeting.findMany({
    where: {
      mentorId,
      status: MeetingStatus.SCHEDULED,
      startsAt: { lt: cutoff },
      openedAt: null,
    },
    include: {
      student: { select: { id: true, fullName: true } },
      mentor: { select: { id: true, fullName: true, role: true } },
      meetingRequest: { select: { course: { select: { title: true } } } },
    },
    take: 20,
  });

  for (const meeting of stale) {
    const when = new Date(meeting.startsAt).toLocaleString();
    const courseTitle = meeting.meetingRequest.course?.title ?? "Coaching session";
    const hostHref = meetingsHrefForRole(meeting.mentor.role);
    const studentHref = "/student/meetings";

    const existing = await db.notification.findFirst({
      where: {
        kind: LATE_MEETING_KIND,
        userId: meeting.mentor.id,
        title: { contains: meeting.id },
      },
      select: { id: true },
    });
    if (existing) continue;

    await createNotification({
      userId: meeting.mentor.id,
      kind: LATE_MEETING_KIND,
      title: `Missed meeting · ${meeting.id.slice(0, 8)}`,
      body: `${meeting.student.fullName} did not join ${courseTitle} (${when}).`,
      href: hostHref,
    });

    await createNotification({
      userId: meeting.student.id,
      kind: LATE_MEETING_KIND,
      title: `Missed meeting with ${meeting.mentor.fullName}`,
      body: `Your session for ${courseTitle} at ${when} was not joined.`,
      href: studentHref,
    });

    await db.meeting.update({
      where: { id: meeting.id },
      data: { status: MeetingStatus.EXPIRED },
    });
  }
}

