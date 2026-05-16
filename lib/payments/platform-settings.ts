import { db } from "@/lib/db";

const PLATFORM_SETTINGS_ID = "default";

export async function getOrCreatePlatformSettings() {
  return db.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_ID },
    create: {
      id: PLATFORM_SETTINGS_ID,
      platformFeePercent: 0,
      minWithdrawalMinorUnits: 50_000, // ₦500 default minimum
    },
    update: {},
  });
}

export function computeFeeSplit(
  amountMinorUnits: number,
  platformFeePercent: number,
): { platformFeeMinorUnits: number; netToMentorMinorUnits: number } {
  const pct = Math.max(0, Math.min(100, platformFeePercent));
  const platformFeeMinorUnits = Math.floor((amountMinorUnits * pct) / 100);
  const netToMentorMinorUnits = amountMinorUnits - platformFeeMinorUnits;
  return { platformFeeMinorUnits, netToMentorMinorUnits };
}
