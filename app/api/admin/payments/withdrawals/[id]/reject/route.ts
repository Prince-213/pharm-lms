import { auth } from "@/auth";
import { UserRole, WithdrawalRequestStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as {
    reason?: string;
  };
  const reason = body?.reason?.trim();
  if (!reason || reason.length < 3) {
    return NextResponse.json({ error: "Rejection reason required." }, { status: 400 });
  }

  const wd = await db.withdrawalRequest.findUnique({ where: { id } });
  if (!wd || wd.status !== WithdrawalRequestStatus.PENDING) {
    return NextResponse.json({ error: "Invalid withdrawal" }, { status: 404 });
  }

  await db.withdrawalRequest.update({
    where: { id },
    data: {
      status: WithdrawalRequestStatus.REJECTED,
      processedAt: new Date(),
      processedById: session.user.id,
      rejectReason: reason,
    },
  });

  return NextResponse.json({ ok: true });
}
