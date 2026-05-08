import { db } from "@/lib/db";

export type ThreadSummary = {
  id: string;
  lastMessageAt: Date | null;
  other: { id: string; fullName: string; email: string; role: string };
  preview: string | null;
  unread: boolean;
};

/**
 * Loads a user's threads with the "other" 1:1 participant resolved.
 * Threads with more than two participants are included with a synthetic
 * "Group" identity so callers don't have to special-case them.
 */
export async function listThreadsForUser(
  userId: string,
): Promise<ThreadSummary[]> {
  const threads = await db.chatThread.findMany({
    where: { participants: { some: { userId } } },
    orderBy: { lastMessageAt: "desc" },
    take: 50,
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, senderId: true, createdAt: true },
      },
    },
  });

  return threads.map((t) => {
    const others = t.participants
      .filter((p) => p.user.id !== userId)
      .map((p) => p.user);
    const other = others[0] ?? {
      id: "group",
      fullName: "Group conversation",
      email: "",
      role: "GROUP",
    };
    const last = t.messages[0];
    return {
      id: t.id,
      lastMessageAt: t.lastMessageAt,
      other,
      preview: last?.body.slice(0, 120) ?? null,
      unread: false,
    };
  });
}

export async function loadThreadForUser(threadId: string, userId: string) {
  const thread = await db.chatThread.findFirst({
    where: { id: threadId, participants: { some: { userId } } },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 200,
        include: {
          sender: { select: { id: true, fullName: true } },
        },
      },
    },
  });
  if (!thread) return null;
  const other = thread.participants.find((p) => p.user.id !== userId)?.user ?? {
    id: "group",
    fullName: "Group conversation",
    email: "",
    role: "GROUP",
  };
  return { thread, other };
}
