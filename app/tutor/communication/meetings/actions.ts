"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { buildJitsiJoinUrl, buildJitsiRoomName } from "@/lib/meetings/jitsi";

async function assertTutor() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return { ok: false as const, message: "Unauthorized" };
  }
  return { ok: true as const, tutorId: session.user.id };
}

export async function acceptMeetingRequestAction(
  meetingRequestId: string,
  startsAtIso: string,
) {
  const authz = await assertTutor();
  if (!authz.ok) return authz;

  const req = await db.meetingRequest.findUnique({
    where: { id: meetingRequestId },
  });
  if (!req || req.mentorId !== authz.tutorId) {
    return { ok: false as const, message: "Meeting request not found." };
  }
  if (req.status !== "PENDING") {
    return {
      ok: false as const,
      message: "Only pending requests can be accepted.",
    };
  }

  const startsAt = new Date(startsAtIso);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false as const, message: "Invalid start time." };
  }

  const roomName = buildJitsiRoomName(
    req.courseId ?? "mentor",
    req.mentorId,
    req.studentId,
  );
  await db.$transaction([
    db.meeting.create({
      data: {
        meetingRequestId: req.id,
        mentorId: req.mentorId,
        studentId: req.studentId,
        roomName,
        joinUrl: buildJitsiJoinUrl(roomName),
        startsAt,
      },
    }),
    db.meetingRequest.update({
      where: { id: req.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  revalidatePath("/tutor/communication/meetings");
  revalidatePath("/student/meetings");
  return { ok: true as const };
}

export async function rejectMeetingRequestAction(meetingRequestId: string) {
  const authz = await assertTutor();
  if (!authz.ok) return authz;

  const req = await db.meetingRequest.findUnique({
    where: { id: meetingRequestId },
  });
  if (!req || req.mentorId !== authz.tutorId) {
    return { ok: false as const, message: "Meeting request not found." };
  }
  if (req.status !== "PENDING") {
    return {
      ok: false as const,
      message: "Only pending requests can be rejected.",
    };
  }

  await db.meetingRequest.update({
    where: { id: req.id },
    data: { status: "REJECTED" },
  });

  revalidatePath("/tutor/communication/meetings");
  revalidatePath("/student/meetings");
  return { ok: true as const };
}
