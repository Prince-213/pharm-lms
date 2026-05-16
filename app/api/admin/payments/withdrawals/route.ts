import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRole, WithdrawalRequestStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status =
    statusParam &&
    Object.values(WithdrawalRequestStatus).includes(
      statusParam as WithdrawalRequestStatus,
    )
      ? (statusParam as WithdrawalRequestStatus)
      : undefined;

  const rows = await db.withdrawalRequest.findMany({
    where: status ? { status } : {},
    orderBy: { requestedAt: "desc" },
    take: 100,
    select: {
      id: true,
      amountMinorUnits: true,
      status: true,
      requestedAt: true,
      processedAt: true,
      rejectReason: true,
      paystackTransferCode: true,
      mentor: {
        select: {
          id: true,
          fullName: true,
          email: true,
          tutorPayoutAccount: {
            select: {
              bankCode: true,
              accountNumber: true,
              accountName: true,
              verifiedAt: true,
            },
          },
        },
      },
    },
  });

  function maskAccount(num: string) {
    if (num.length <= 4) return "••••";
    return `••••${num.slice(-4)}`;
  }

  return NextResponse.json({
    withdrawals: rows.map((r) => ({
      id: r.id,
      amountMinorUnits: r.amountMinorUnits,
      status: r.status,
      requestedAt: r.requestedAt.toISOString(),
      processedAt: r.processedAt?.toISOString() ?? null,
      rejectReason: r.rejectReason,
      paystackTransferCode: r.paystackTransferCode,
      mentor: {
        id: r.mentor.id,
        fullName: r.mentor.fullName,
        email: r.mentor.email,
      },
      bankDisplay: r.mentor.tutorPayoutAccount
        ? {
            accountName: r.mentor.tutorPayoutAccount.accountName,
            bankCode: r.mentor.tutorPayoutAccount.bankCode,
            accountMasked: maskAccount(
              r.mentor.tutorPayoutAccount.accountNumber,
            ),
            verified: Boolean(r.mentor.tutorPayoutAccount.verifiedAt),
          }
        : null,
    })),
  });
}
