import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { getTutorWalletBalances } from "@/lib/payments/tutor-wallet";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balances = await getTutorWalletBalances(session.user.id);
  return NextResponse.json(balances);
}
