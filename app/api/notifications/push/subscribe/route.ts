import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey?.trim()) {
    return NextResponse.json(
      { error: "Push notifications are not configured." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
  }

  await db.notificationSubscription.upsert({
    where: {
      userId_endpoint: {
        userId: session.user.id,
        endpoint: parsed.data.endpoint,
      },
    },
    create: {
      userId: session.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    },
    update: {
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    },
  });

  return NextResponse.json({ ok: true, publicKey });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { endpoint?: string };
  if (!body.endpoint) {
    return NextResponse.json({ error: "endpoint required" }, { status: 400 });
  }

  await db.notificationSubscription.deleteMany({
    where: { userId: session.user.id, endpoint: body.endpoint },
  });

  return NextResponse.json({ ok: true });
}
