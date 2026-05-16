import { auth } from "@/auth";
import { WithdrawalRequestStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { getOrCreatePlatformSettings } from "@/lib/payments/platform-settings";
import { getTutorWalletBalances } from "@/lib/payments/tutor-wallet";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const take = Math.min(50, Math.max(5, Number(searchParams.get("take")) || 20));

  const rows = await db.withdrawalRequest.findMany({
    where: { mentorId: session.user.id },
    orderBy: { requestedAt: "desc" },
    take,
    select: {
      id: true,
      amountMinorUnits: true,
      status: true,
      requestedAt: true,
      processedAt: true,
      rejectReason: true,
      paystackTransferCode: true,
    },
  });

  return NextResponse.json({
    withdrawals: rows.map((r) => ({
      ...r,
      requestedAt: r.requestedAt.toISOString(),
      processedAt: r.processedAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    amountMinorUnits?: number;
  };
  const amount = body?.amountMinorUnits;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  const floored = Math.floor(amount);

  const account = await db.tutorPayoutAccount.findUnique({
    where: { userId: session.user.id },
  });
  if (!account?.verifiedAt) {
    return NextResponse.json(
      { error: "Verify your payout bank account first." },
      { status: 400 },
    );
  }

  const settings = await getOrCreatePlatformSettings();
  if (floored < settings.minWithdrawalMinorUnits) {
    return NextResponse.json(
      {
        error: `Minimum withdrawal is ₦${(settings.minWithdrawalMinorUnits / 100).toLocaleString("en-NG")}.`,
      },
      { status: 400 },
    );
  }

  const wallet = await getTutorWalletBalances(session.user.id);
  if (floored > wallet.availableMinor) {
    return NextResponse.json(
      { error: "Amount exceeds available balance." },
      { status: 400 },
    );
  }

  await db.withdrawalRequest.create({
    data: {
      mentorId: session.user.id,
      amountMinorUnits: floored,
      status: WithdrawalRequestStatus.PENDING,
    },
  });

  return NextResponse.json({ ok: true });
}
