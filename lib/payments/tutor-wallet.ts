import {
  CoursePurchaseStatus,
  WithdrawalRequestStatus,
} from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export type TutorWalletBalances = {
  lifetimeEarnedMinor: number;
  reservedMinor: number;
  lifetimeWithdrawnMinor: number;
  availableMinor: number;
};

export async function getTutorWalletBalances(
  mentorId: string,
): Promise<TutorWalletBalances> {
  const [earnedAgg, reservedAgg, withdrawnAgg] = await Promise.all([
    db.coursePurchase.aggregate({
      where: { mentorId, status: CoursePurchaseStatus.SUCCESS },
      _sum: { netToMentorMinorUnits: true },
    }),
    db.withdrawalRequest.aggregate({
      where: {
        mentorId,
        status: {
          in: [WithdrawalRequestStatus.PENDING, WithdrawalRequestStatus.APPROVED],
        },
      },
      _sum: { amountMinorUnits: true },
    }),
    db.withdrawalRequest.aggregate({
      where: { mentorId, status: WithdrawalRequestStatus.PAID },
      _sum: { amountMinorUnits: true },
    }),
  ]);

  const lifetimeEarnedMinor = earnedAgg._sum.netToMentorMinorUnits ?? 0;
  const reservedMinor = reservedAgg._sum.amountMinorUnits ?? 0;
  const lifetimeWithdrawnMinor = withdrawnAgg._sum.amountMinorUnits ?? 0;
  const availableMinor = Math.max(
    0,
    lifetimeEarnedMinor - reservedMinor - lifetimeWithdrawnMinor,
  );

  return {
    lifetimeEarnedMinor,
    reservedMinor,
    lifetimeWithdrawnMinor,
    availableMinor,
  };
}
