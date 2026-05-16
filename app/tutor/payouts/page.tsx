import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { TutorPayoutsClient } from "@/components/mentor/tutor-payouts-client";
import { db } from "@/lib/db";
import { getOrCreatePlatformSettings } from "@/lib/payments/platform-settings";
import { getTutorWalletBalances } from "@/lib/payments/tutor-wallet";
import { roleHomePath } from "@/lib/rbac";

export default async function TutorPayoutsPage() {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) redirect(roleHomePath(session.user.role));

  const mentorId = session.user.id;
  const [wallet, accountRow, withdrawals, settings] = await Promise.all([
    getTutorWalletBalances(mentorId),
    db.tutorPayoutAccount.findUnique({ where: { userId: mentorId } }),
    db.withdrawalRequest.findMany({
      where: { mentorId },
      orderBy: { requestedAt: "desc" },
      take: 30,
      select: {
        id: true,
        amountMinorUnits: true,
        status: true,
        requestedAt: true,
        processedAt: true,
        rejectReason: true,
      },
    }),
    getOrCreatePlatformSettings(),
  ]);

  const account = accountRow
    ? {
        bankCode: accountRow.bankCode,
        bankName: accountRow.bankName,
        accountNumber:
          accountRow.accountNumber.length <= 4
            ? "****"
            : `••••${accountRow.accountNumber.slice(-4)}`,
        accountName: accountRow.accountName,
        verifiedAt: accountRow.verifiedAt?.toISOString() ?? null,
      }
    : null;

  return (
    <TutorPayoutsClient
      initialWallet={wallet}
      initialAccount={account}
      initialWithdrawals={withdrawals.map((w) => ({
        ...w,
        requestedAt: w.requestedAt.toISOString(),
        processedAt: w.processedAt?.toISOString() ?? null,
      }))}
      minWithdrawalMinorUnits={settings.minWithdrawalMinorUnits}
      settlementNote={settings.paystackSettlementNote}
    />
  );
}
