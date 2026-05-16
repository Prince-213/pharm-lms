import { auth } from "@/auth";
import { UserRole, WithdrawalRequestStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import {
  createTransferRecipient,
  initiateTransfer,
} from "@/lib/paystack/client";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const wd = await db.withdrawalRequest.findUnique({
    where: { id },
  });
  if (!wd || wd.status !== WithdrawalRequestStatus.PENDING) {
    return NextResponse.json({ error: "Invalid withdrawal" }, { status: 404 });
  }

  const account = await db.tutorPayoutAccount.findUnique({
    where: { userId: wd.mentorId },
  });
  if (!account) {
    return NextResponse.json(
      { error: "Tutor has no payout account." },
      { status: 400 },
    );
  }

  let transferCode = "";
  try {
    const recipient = await createTransferRecipient({
      type: "nuban",
      name: account.accountName,
      account_number: account.accountNumber,
      bank_code: account.bankCode,
      currency: "NGN",
    });
    const transfer = await initiateTransfer({
      source: "balance",
      amountMinorUnits: wd.amountMinorUnits,
      recipient: recipient.recipient_code,
      reason: `PharmLMS payout ${wd.id}`,
      reference: `wd_${wd.id.replace(/[^a-z0-9]/gi, "").slice(0, 10)}_${Date.now().toString(36)}`,
    });
    transferCode = transfer.transfer_code;
  } catch (e) {
    console.error("paystack transfer", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Paystack transfer failed. Ensure transfer is enabled and balance covers the amount.",
      },
      { status: 502 },
    );
  }

  await db.withdrawalRequest.update({
    where: { id },
    data: {
      status: WithdrawalRequestStatus.PAID,
      processedAt: new Date(),
      processedById: session.user.id,
      paystackTransferCode: transferCode,
    },
  });

  return NextResponse.json({ ok: true, transferCode });
}
