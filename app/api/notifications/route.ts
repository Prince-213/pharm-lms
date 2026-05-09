import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const LIST_LIMIT = 40;

const patchSchema = z.object({
  markAllRead: z.boolean().optional(),
  notificationId: z.string().min(1).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [items, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
      select: {
        id: true,
        kind: true,
        title: true,
        body: true,
        href: true,
        assignmentId: true,
        readAt: true,
        createdAt: true,
      },
    }),
    db.notification.count({
      where: { userId, readAt: null },
    }),
  ]);

  return NextResponse.json({
    items: items.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      readAt: n.readAt?.toISOString() ?? null,
    })),
    unreadCount,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const now = new Date();

  if (parsed.data.markAllRead) {
    await db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: now },
    });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.notificationId) {
    const res = await db.notification.updateMany({
      where: {
        id: parsed.data.notificationId,
        userId,
        readAt: null,
      },
      data: { readAt: now },
    });
    return NextResponse.json({ ok: true, updated: res.count });
  }

  return NextResponse.json(
    { error: "Provide markAllRead or notificationId" },
    { status: 400 },
  );
}
