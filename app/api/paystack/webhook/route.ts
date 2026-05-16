import { completeCoursePurchaseFromReference } from "@/lib/payments/complete-course-purchase";
import { verifyWebhookSignature } from "@/lib/paystack/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PaystackWebhookBody = {
  event?: string;
  data?: {
    reference?: string;
    id?: number;
  };
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: PaystackWebhookBody;
  try {
    parsed = JSON.parse(rawBody) as PaystackWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (parsed.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = parsed.data?.reference;
  if (!reference) {
    return NextResponse.json({ received: true });
  }

  const txId = parsed.data?.id != null ? String(parsed.data.id) : undefined;
  await completeCoursePurchaseFromReference(reference, {
    paystackTransactionId: txId,
  });

  return NextResponse.json({ received: true });
}
