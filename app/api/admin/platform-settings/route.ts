import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { getOrCreatePlatformSettings } from "@/lib/payments/platform-settings";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const s = await getOrCreatePlatformSettings();
  return NextResponse.json({
    platformFeePercent: s.platformFeePercent,
    minWithdrawalMinorUnits: s.minWithdrawalMinorUnits,
    paystackSettlementNote: s.paystackSettlementNote,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    platformFeePercent?: number;
    minWithdrawalMinorUnits?: number;
    paystackSettlementNote?: string | null;
  };

  const fee =
    typeof body.platformFeePercent === "number"
      ? Math.max(0, Math.min(100, Math.floor(body.platformFeePercent)))
      : undefined;
  const minWd =
    typeof body.minWithdrawalMinorUnits === "number"
      ? Math.max(0, Math.floor(body.minWithdrawalMinorUnits))
      : undefined;
  const note =
    typeof body.paystackSettlementNote === "string"
      ? body.paystackSettlementNote.trim() || null
      : body.paystackSettlementNote === null
        ? null
        : undefined;

  const current = await getOrCreatePlatformSettings();
  const updated = await db.platformSettings.update({
    where: { id: current.id },
    data: {
      ...(fee !== undefined ? { platformFeePercent: fee } : {}),
      ...(minWd !== undefined ? { minWithdrawalMinorUnits: minWd } : {}),
      ...(note !== undefined ? { paystackSettlementNote: note } : {}),
    },
  });

  return NextResponse.json({
    platformFeePercent: updated.platformFeePercent,
    minWithdrawalMinorUnits: updated.minWithdrawalMinorUnits,
    paystackSettlementNote: updated.paystackSettlementNote,
  });
}
