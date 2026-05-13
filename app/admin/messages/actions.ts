"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createForumPostAction } from "@/app/student/course/[courseId]/forum/actions";
import { UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const broadcastSchema = z.object({
  audience: z.enum(["STUDENTS", "INSTRUCTORS", "ALL_LEARNERS"]),
  title: z.string().trim().min(2).max(180),
  body: z.string().trim().min(1).max(2000),
  href: z.string().trim().max(500).optional().nullable(),
});

export type AdminBroadcastResult =
  | { ok: true; recipientCount: number }
  | { ok: false; message: string };

/**
 * Creates an in-app notification for each user in the selected audience.
 * Admins are never targeted. Sends in batches for large user sets.
 */
export async function adminBroadcastNotificationAction(
  input: z.infer<typeof broadcastSchema>,
): Promise<AdminBroadcastResult> {
  await requireAdminSession();
  const parsed = broadcastSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
    return { ok: false, message: msg };
  }

  const { audience, title, body, href: hrefNorm } = parsed.data;

  let roles: UserRole[];
  switch (audience) {
    case "STUDENTS":
      roles = [UserRole.STUDENT];
      break;
    case "INSTRUCTORS":
      roles = [UserRole.TUTOR, UserRole.MENTOR];
      break;
    case "ALL_LEARNERS":
      roles = [UserRole.STUDENT, UserRole.TUTOR, UserRole.MENTOR];
      break;
    default:
      roles = [UserRole.STUDENT];
  }

  const users = await db.user.findMany({
    where: { role: { in: roles } },
    select: { id: true },
  });
  if (users.length === 0) {
    return { ok: false, message: "No recipients match this audience." };
  }

  const data = users.map((u) => ({
    userId: u.id,
    kind: "ADMIN_BROADCAST",
    title,
    body,
    href: hrefNorm,
  }));

  const BATCH = 250;
  for (let i = 0; i < data.length; i += BATCH) {
    await db.notification.createMany({ data: data.slice(i, i + BATCH) });
  }

  revalidatePath("/admin/messages");
  return { ok: true, recipientCount: users.length };
}

const forumPostSchema = z.object({
  courseId: z.string().min(1),
  body: z.string().trim().min(2).max(2000),
});

export type AdminForumPostResult =
  | { ok: true }
  | { ok: false; message: string };

export async function adminForumPostAction(
  input: z.infer<typeof forumPostSchema>,
): Promise<AdminForumPostResult> {
  await requireAdminSession();
  const parsed = forumPostSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check your message and try again." };
  }
  const res = await createForumPostAction(
    parsed.data.courseId,
    parsed.data.body,
  );
  if (!res.ok) return { ok: false, message: res.message };
  revalidatePath("/admin/messages");
  return { ok: true };
}
