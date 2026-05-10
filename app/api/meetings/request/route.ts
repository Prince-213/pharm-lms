import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  MeetingRequestStatus,
  MentorProfileStatus,
  UserRole,
} from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { buildJitsiJoinUrl, buildJitsiRoomName } from "@/lib/meetings/jitsi";
import { notifyHostNewMeetingRequest } from "@/lib/notifications/meeting-events";
import { meetingRequestSchema } from "@/lib/validation/lms";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = meetingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const courseId = parsed.data.courseId ?? null;

  // Booking a tutor (course-specific) vs booking a mentor (career mentor, course-less).
  if (courseId) {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, mentorId: true },
    });
    if (!course || course.mentorId !== parsed.data.mentorId) {
      return NextResponse.json(
        { error: "Invalid tutor/course selection." },
        { status: 400 },
      );
    }

    const enrollment = await db.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: session.user.id,
        },
      },
      select: { id: true },
    });
    if (!enrollment) {
      return NextResponse.json(
        { error: "You must be enrolled to book this tutor." },
        { status: 403 },
      );
    }
  } else {
    const mentor = await db.user.findFirst({
      where: { id: parsed.data.mentorId, role: UserRole.MENTOR },
      select: { id: true, mentorProfileStatus: true },
    });
    if (
      !mentor ||
      mentor.mentorProfileStatus !== MentorProfileStatus.APPROVED
    ) {
      return NextResponse.json(
        { error: "This mentor is not available for booking." },
        { status: 400 },
      );
    }
  }

  const instant = Boolean(parsed.data.instant);

  const meetingRequest = await db.meetingRequest.create({
    data: {
      courseId,
      mentorId: parsed.data.mentorId,
      studentId: session.user.id,
      preferredTime: parsed.data.preferredTime
        ? new Date(parsed.data.preferredTime)
        : null,
      message: parsed.data.message,
      status: instant
        ? MeetingRequestStatus.ACCEPTED
        : MeetingRequestStatus.PENDING,
    },
  });

  if (instant) {
    const roomName = buildJitsiRoomName(
      courseId ?? "mentor",
      parsed.data.mentorId,
      session.user.id,
    );
    const meeting = await db.meeting.create({
      data: {
        meetingRequestId: meetingRequest.id,
        mentorId: parsed.data.mentorId,
        studentId: session.user.id,
        roomName,
        joinUrl: buildJitsiJoinUrl(roomName),
        startsAt: new Date(),
      },
    });
    await notifyHostNewMeetingRequest(meetingRequest.id);
    return NextResponse.json(
      { meetingRequest, meeting, instant: true },
      { status: 201 },
    );
  }

  await notifyHostNewMeetingRequest(meetingRequest.id);
  return NextResponse.json(meetingRequest, { status: 201 });
}
