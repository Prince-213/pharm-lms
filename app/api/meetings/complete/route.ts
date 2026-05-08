import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { MeetingStatus, UserRole } from "@/generated/prisma/enums";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { db } from "@/lib/db";

const schema = z.object({
  meetingId: z.string().cuid(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (
    session.user.role !== UserRole.MENTOR &&
    session.user.role !== UserRole.STUDENT
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

  const meeting = await db.meeting.findUnique({
    where: { id: parsed.data.meetingId },
    select: { id: true, mentorId: true, studentId: true, status: true },
  });
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  }
  if (meeting.status !== MeetingStatus.SCHEDULED) {
    return NextResponse.json(
      { error: "Meeting is no longer active." },
      { status: 409 },
    );
  }
  const authorized =
    (session.user.role === UserRole.MENTOR &&
      meeting.mentorId === session.user.id) ||
    (session.user.role === UserRole.STUDENT &&
      meeting.studentId === session.user.id);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await db.meeting.update({
    where: { id: meeting.id },
    data: { status: MeetingStatus.COMPLETED, endsAt: new Date() },
  });

  await evaluateStudentBadges(meeting.studentId);

  return NextResponse.json(updated, { status: 200 });
}
