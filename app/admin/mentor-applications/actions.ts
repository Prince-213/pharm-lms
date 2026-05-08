"use server";

import { revalidatePath } from "next/cache";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function approveMentorApplicationAction(mentorId: string) {
  await requireAdminSession();
  await db.user.update({
    where: { id: mentorId, role: UserRole.MENTOR },
    data: {
      mentorProfileStatus: MentorProfileStatus.APPROVED,
      mentorReviewedAt: new Date(),
      mentorReviewNote: null,
    },
    select: { id: true },
  });
  revalidatePath("/admin/mentor-applications");
}

export async function rejectMentorApplicationAction(
  mentorId: string,
  note: string,
) {
  await requireAdminSession();
  const trimmed = note.trim();
  await db.user.update({
    where: { id: mentorId, role: UserRole.MENTOR },
    data: {
      mentorProfileStatus: MentorProfileStatus.REJECTED,
      mentorReviewedAt: new Date(),
      mentorReviewNote: trimmed.length ? trimmed : "Please update your profile and resubmit.",
    },
    select: { id: true },
  });
  revalidatePath("/admin/mentor-applications");
}

