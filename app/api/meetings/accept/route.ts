import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { buildJitsiJoinUrl, buildJitsiRoomName } from "@/lib/meetings/jitsi";

const schema = z.object({
  meetingRequestId: z.string().cuid(),
  startsAt: z.string().datetime(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.TUTOR && session.user.role !== UserRole.MENTOR)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const meetingRequest = await db.meetingRequest.findUnique({
    where: { id: parsed.data.meetingRequestId },
  });

  if (!meetingRequest || meetingRequest.mentorId !== session.user.id) {
    return NextResponse.json(
      { error: "Meeting request not found." },
      { status: 404 },
    );
  }

  const roomName = buildJitsiRoomName(
    meetingRequest.courseId ?? "mentor",
    meetingRequest.mentorId,
    meetingRequest.studentId,
  );

  const meeting = await db.meeting.create({
    data: {
      meetingRequestId: meetingRequest.id,
      mentorId: meetingRequest.mentorId,
      studentId: meetingRequest.studentId,
      roomName,
      joinUrl: buildJitsiJoinUrl(roomName),
      startsAt: new Date(parsed.data.startsAt),
    },
  });

  await db.meetingRequest.update({
    where: { id: meetingRequest.id },
    data: { status: "ACCEPTED" },
  });

  return NextResponse.json(meeting, { status: 201 });
}
