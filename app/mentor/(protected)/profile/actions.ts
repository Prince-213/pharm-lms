"use server";

import { auth } from "@/auth";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export async function updateMentorProfileAction(input: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.MENTOR) {
    return;
  }

  const fullName = String(input.get("fullName") ?? "").trim();
  const bio = String(input.get("bio") ?? "").trim();
  const avatarUrlRaw = String(input.get("avatarUrl") ?? "").trim();
  const avatarUrl = avatarUrlRaw.length ? avatarUrlRaw : null;

  if (fullName.length < 2) return;
  if (bio.length < 20) return;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      fullName,
      bio,
      avatarUrl,
      mentorProfileStatus: MentorProfileStatus.INCOMPLETE,
    },
    select: { id: true },
  });

  return;
}

export async function submitMentorReviewRequestAction(): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.MENTOR) {
    return;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      mentorReviewRequestedAt: true,
    },
  });
  if (!user) return;
  if (user.mentorReviewRequestedAt) return;

  const fullName = user.fullName.trim();
  const bio = (user.bio ?? "").trim();
  const avatarUrl = (user.avatarUrl ?? "").trim();
  if (fullName.length < 2 || bio.length < 20 || avatarUrl.length < 6) return;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      mentorProfileStatus: MentorProfileStatus.PENDING_REVIEW,
      mentorReviewRequestedAt: new Date(),
    },
    select: { id: true },
  });

  return;
}
