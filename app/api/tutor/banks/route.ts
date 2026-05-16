import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { listBanks } from "@/lib/paystack/client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const banks = await listBanks({ country: "nigeria", currency: "NGN" });
    return NextResponse.json({ banks });
  } catch (e) {
    console.error("list banks", e);
    return NextResponse.json(
      { error: "Could not load banks." },
      { status: 502 },
    );
  }
}
