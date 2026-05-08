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

  await db.$transaction([
    db.chatMessage.create({
      data: { threadId, senderId, body: parsed.data.body.trim() },
    }),
    db.chatThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  revalidatePath("/mentor/communication/messages");
  revalidatePath("/admin/messages");
  revalidatePath("/student/messages");
  return { ok: true, threadId };
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

  for (const studentId of studentIds) {
    const threadId = await findOrCreateThread(session.user.id, studentId);
    await db.$transaction([
      db.chatMessage.create({
        data: {
          threadId,
          senderId: session.user.id,
          body: parsed.data.body.trim(),
        },
      }),
      db.chatThread.update({
        where: { id: threadId },
        data: { lastMessageAt: new Date() },
      }),
    ]);
  }

  revalidatePath("/mentor/communication/messages");
  return { ok: true, recipients: studentIds.length };
}
