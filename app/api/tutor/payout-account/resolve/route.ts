import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { resolveBankAccount } from "@/lib/paystack/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    bankCode?: string;
    accountNumber?: string;
  };
  const bankCode = body.bankCode?.trim();
  const accountNumber = body.accountNumber?.replace(/\s/g, "");
  if (!bankCode || !accountNumber) {
    return NextResponse.json({ error: "bankCode and accountNumber required" }, { status: 400 });
  }

  try {
    const data = await resolveBankAccount(bankCode, accountNumber);
    return NextResponse.json({
      accountName: data.account_name,
      accountNumber: data.account_number,
    });
  } catch (e) {
    console.error("resolve bank", e);
    const message =
      e instanceof Error ? e.message : "Could not verify account.";
    const isConfig =
      message.includes("PAYSTACK_SECRET_KEY") ||
      message.includes("not set");
    return NextResponse.json(
      {
        error: isConfig
          ? "Payments are not configured on the server."
          : message.includes("Paystack")
            ? message
            : "Could not verify account. Check bank and account number.",
      },
      { status: isConfig ? 503 : 400 },
    );
  }
}
