import { db } from "@/lib/db";

export { computeFeeSplit } from "@/lib/payments/fee-split";

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
