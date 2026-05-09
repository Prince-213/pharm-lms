"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

const sendSchema = z.object({
  threadId: z.string().min(1).optional(),
  recipientId: z.string().min(1).optional(),
  body: z.string().min(1).max(4000),
});

export type SendMessageInput = z.infer<typeof sendSchema>;
export type SendMessageResult =
  | { ok: true; threadId: string }
  | { ok: false; message: string };

/**
 * Looks up (or creates) a 1:1 thread between two users. Threads are
 * deduplicated by participant set, so the same pair never gets two threads.
 */
async function findOrCreateThread(
  userAId: string,
  userBId: string,
): Promise<string> {
  const existing = await db.chatThread.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: userAId } } },
        { participants: { some: { userId: userBId } } },
      ],
    },
    select: {
      id: true,
      participants: { select: { userId: true } },
    },
  });

  if (existing && existing.participants.length === 2) {
    return existing.id;
  }

  const thread = await db.chatThread.create({
    data: {
      participants: {
        create: [{ userId: userAId }, { userId: userBId }],
      },
    },
    select: { id: true },
  });
  return thread.id;
}

async function postMessageToThread(
  threadId: string,
  senderId: string,
  body: string,
) {
  const trimmed = body.trim();
  await db.$transaction([
    db.chatMessage.create({
      data: { threadId, senderId, body: trimmed },
    }),
    db.chatThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    }),
  ]);
}

function revalidateMessageSurfaces() {
  revalidatePath("/mentor/communication/messages");
  revalidatePath("/admin/messages");
  revalidatePath("/student/messages");
}

/**
 * Posts a message into an existing thread (`threadId`) or starts a new one
 * with `recipientId`. Both sides see the new message immediately.
 */
export async function sendChatMessageAction(
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const session = await auth();
  if (!session?.user)
    return { ok: false, message: "Sign in to send messages." };

  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Message is required." };

  const senderId = session.user.id;
  let threadId = parsed.data.threadId;

  if (!threadId) {
    if (!parsed.data.recipientId || parsed.data.recipientId === senderId) {
      return {
        ok: false,
        message: "Pick a recipient to start a conversation.",
      };
    }
    const recipient = await db.user.findUnique({
      where: { id: parsed.data.recipientId },
      select: { id: true },
    });
    if (!recipient) return { ok: false, message: "Recipient not found." };
    threadId = await findOrCreateThread(senderId, recipient.id);
  } else {
    const member = await db.chatThreadParticipant.findUnique({
      where: { threadId_userId: { threadId, userId: senderId } },
    });
    if (!member)
      return { ok: false, message: "You can't post in this thread." };
  }

  await postMessageToThread(threadId, senderId, parsed.data.body);
  revalidateMessageSurfaces();
  return { ok: true, threadId };
}

const adminDmSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

/**
 * Admin-only: start or continue a 1:1 thread with any user by id.
 */
export async function adminSendUserMessageAction(
  input: z.infer<typeof adminDmSchema>,
): Promise<SendMessageResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { ok: false, message: "Admins only." };
  }

  const parsed = adminDmSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Message is required." };

  const senderId = session.user.id;
  const { recipientId, body } = parsed.data;
  if (recipientId === senderId) {
    return { ok: false, message: "Invalid recipient." };
  }

  const recipient = await db.user.findUnique({
    where: { id: recipientId },
    select: { id: true },
  });
  if (!recipient) return { ok: false, message: "Recipient not found." };

  const threadId = await findOrCreateThread(senderId, recipient.id);

  await postMessageToThread(threadId, senderId, body);
  revalidateMessageSurfaces();
  return { ok: true, threadId };
}

const BROADCAST_SECTOR_ROLES = [
  UserRole.STUDENT,
  UserRole.TUTOR,
  UserRole.MENTOR,
] as const;

const adminBroadcastSchema = z
  .object({
    body: z.string().min(1).max(4000),
    mode: z.enum(["ALL", "CUSTOM"]),
    roles: z
      .array(z.enum(["STUDENT", "TUTOR", "MENTOR"]))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "CUSTOM") {
      if (!data.roles?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select at least one sector.",
          path: ["roles"],
        });
      }
    }
  });

const adminBroadcastPreviewSchema = z
  .object({
    mode: z.enum(["ALL", "CUSTOM"]),
    roles: z.array(z.enum(["STUDENT", "TUTOR", "MENTOR"])).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "CUSTOM" && !data.roles?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one sector.",
        path: ["roles"],
      });
    }
  });

export type AdminBroadcastPreviewResult =
  | { ok: true; count: number }
  | { ok: false; message: string };

export async function adminBroadcastRecipientPreviewAction(
  input: z.infer<typeof adminBroadcastPreviewSchema>,
): Promise<AdminBroadcastPreviewResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { ok: false, message: "Admins only." };
  }

  const parsed = adminBroadcastPreviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Select at least one sector." };
  }

  const roleFilter =
    parsed.data.mode === "ALL"
      ? [...BROADCAST_SECTOR_ROLES]
      : (parsed.data.roles!.map((r) => UserRole[r]) as UserRole[]);

  const count = await db.user.count({
    where: {
      role: { in: roleFilter },
      id: { not: session.user.id },
    },
  });

  return { ok: true, count };
}

/**
 * Admin-only: post the same message into a 1:1 thread with every matching user
 * (students, tutors, mentors — never admins).
 */
export async function adminBroadcastAudienceAction(
  input: z.infer<typeof adminBroadcastSchema>,
): Promise<BroadcastResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { ok: false, message: "Admins only." };
  }

  const parsed = adminBroadcastSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0];
    return { ok: false, message: msg ?? "Invalid input." };
  }

  const roleFilter =
    parsed.data.mode === "ALL"
      ? [...BROADCAST_SECTOR_ROLES]
      : (parsed.data.roles!.map((r) => UserRole[r]) as UserRole[]);

  const recipients = await db.user.findMany({
    where: {
      role: { in: roleFilter },
      id: { not: session.user.id },
    },
    select: { id: true },
  });

  if (recipients.length === 0) {
    return { ok: false, message: "No recipients match this audience." };
  }

  const body = parsed.data.body.trim();
  const adminId = session.user.id;

  for (const { id } of recipients) {
    const threadId = await findOrCreateThread(adminId, id);
    await postMessageToThread(threadId, adminId, body);
  }

  revalidateMessageSurfaces();
  return { ok: true, recipients: recipients.length };
}

const broadcastSchema = z.object({
  courseId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

export type BroadcastResult =
  | { ok: true; recipients: number }
  | { ok: false; message: string };

/**
 * Mentor-only: starts (or continues) 1:1 threads with every active enrollee
 * of a course and posts the same body to each. Useful for course-wide updates
 * before a dedicated announcements module exists.
 */
export async function broadcastToCourseAction(input: {
  courseId: string;
  body: string;
}): Promise<BroadcastResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.MENTOR) {
    return { ok: false, message: "Mentors only." };
  }
  const parsed = broadcastSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Message is required." };

  const course = await db.course.findFirst({
    where: { id: parsed.data.courseId, mentorId: session.user.id },
    select: { id: true },
  });
  if (!course) return { ok: false, message: "Course not found." };

  const enrollments = await db.enrollment.findMany({
    where: { courseId: course.id },
    select: { studentId: true },
  });
  const studentIds = Array.from(new Set(enrollments.map((e) => e.studentId)));
  if (studentIds.length === 0) {
    return { ok: false, message: "No enrolled students yet." };
  }

  const body = parsed.data.body.trim();
  const senderId = session.user.id;
  for (const studentId of studentIds) {
    const threadId = await findOrCreateThread(senderId, studentId);
    await postMessageToThread(threadId, senderId, body);
  }

  revalidatePath("/mentor/communication/messages");
  return { ok: true, recipients: studentIds.length };
}
