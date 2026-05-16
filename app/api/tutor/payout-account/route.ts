import { auth } from "@/auth";
import { UserRole, WithdrawalRequestStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function maskAccount(num: string) {
  const d = num.replace(/\s/g, "");
  if (d.length <= 4) return "****";
  return `••••${d.slice(-4)}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await db.tutorPayoutAccount.findUnique({
    where: { userId: session.user.id },
  });
  if (!row) {
    return NextResponse.json({ account: null });
  }
  return NextResponse.json({
    account: {
      bankCode: row.bankCode,
      bankName: row.bankName,
      accountNumber: maskAccount(row.accountNumber),
      accountName: row.accountName,
      verifiedAt: row.verifiedAt?.toISOString() ?? null,
    },
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pendingWd = await db.withdrawalRequest.findFirst({
    where: { mentorId: session.user.id, status: WithdrawalRequestStatus.PENDING },
    select: { id: true },
  });
  if (pendingWd) {
    return NextResponse.json(
      { error: "Cannot change bank while a withdrawal is pending." },
      { status: 400 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    bankCode?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  const bankCode = body.bankCode?.trim();
  const accountNumber = body.accountNumber?.replace(/\s/g, "");
  const accountName = body.accountName?.trim();
  const bankName = body.bankName?.trim() || null;
  if (!bankCode || !accountNumber || !accountName) {
    return NextResponse.json({ error: "Invalid bank details." }, { status: 400 });
  }

  await db.tutorPayoutAccount.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      bankCode,
      bankName,
      accountNumber,
      accountName,
      verifiedAt: new Date(),
      lastResolvedAt: new Date(),
    },
    update: {
      bankCode,
      bankName,
      accountNumber,
      accountName,
      verifiedAt: new Date(),
      lastResolvedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
