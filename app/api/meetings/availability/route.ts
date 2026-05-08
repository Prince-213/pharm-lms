import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

const schema = z.object({
  timezone: z.string().min(2).max(80),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  days: z.array(z.number().int().min(0).max(6)).min(1),
});

export async function GET() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.TUTOR && session.user.role !== UserRole.MENTOR)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slots = await db.mentorAvailability.findMany({
    where: { mentorId: session.user.id, isRecurring: true },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ slots }, { status: 200 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== UserRole.TUTOR && session.user.role !== UserRole.MENTOR)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { timezone, startTime, endTime, days } = parsed.data;
  if (startTime >= endTime) {
    return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
  }

  await db.$transaction(async (tx) => {
    await tx.mentorAvailability.deleteMany({
      where: { mentorId: session.user.id, isRecurring: true },
    });
    await tx.mentorAvailability.createMany({
      data: days.map((day) => ({
        mentorId: session.user.id,
        dayOfWeek: day,
        startTime,
        endTime,
        timezone,
        isRecurring: true,
      })),
    });
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
