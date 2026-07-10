"use server";

import { revalidatePath } from "next/cache";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { notifyMentorAccountActivated } from "@/lib/notifications/mentor-events";

function revalidateMentorVisibility() {
  revalidatePath("/admin/mentor-applications");
  revalidatePath("/admin/mentors");
  revalidatePath("/admin/dashboard");
  revalidatePath("/student/mentors");
}

export async function approveMentorApplicationAction(mentorId: string) {
  await requireAdminSession();
  // Mentors sign up inactive; approval must activate them so students can see/book them.
  await db.user.update({
    where: { id: mentorId, role: UserRole.MENTOR },
    data: {
      mentorProfileStatus: MentorProfileStatus.APPROVED,
      mentorReviewedAt: new Date(),
      mentorReviewNote: null,
      isActive: true,
    },
    select: { id: true },
  });
  void notifyMentorAccountActivated(mentorId, true);
  revalidateMentorVisibility();
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
      mentorReviewNote: trimmed.length
        ? trimmed
        : "Please update your profile and resubmit.",
      isActive: false,
    },
    select: { id: true },
  });
  revalidateMentorVisibility();
}
