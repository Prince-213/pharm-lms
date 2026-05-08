import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { MeetingRequestStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

const schema = z.object({
  meetingRequestId: z.string().cuid(),
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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const req = await db.meetingRequest.findUnique({
    where: { id: parsed.data.meetingRequestId },
    select: { id: true, mentorId: true, status: true },
  });
  if (!req || req.mentorId !== session.user.id) {
    return NextResponse.json({ error: "Meeting request not found." }, { status: 404 });
  }
  if (req.status !== MeetingRequestStatus.PENDING) {
    return NextResponse.json({ error: "Only pending requests can be rejected." }, { status: 400 });
  }

  const updated = await db.meetingRequest.update({
    where: { id: req.id },
    data: { status: MeetingRequestStatus.REJECTED },
  });
  return NextResponse.json(updated, { status: 200 });
}
