import { createHmac, timingSafeEqual } from "node:crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

export function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
  }
  return key;
}

export function getPaystackPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim();
  if (!key) {
    throw new Error("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set");
  }
  return key;
}

type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

async function paystackFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const raw = await res.text();
  let json: PaystackEnvelope<T> | null = null;
  if (raw.trim()) {
    try {
      json = JSON.parse(raw) as PaystackEnvelope<T>;
    } catch {
      throw new Error(
        `Paystack returned invalid JSON (${res.status}): ${raw.slice(0, 200)}`,
      );
    }
  }

  if (!json) {
    throw new Error(
      `Paystack returned an empty response (${res.status}) for ${path}`,
    );
  }

  if (!res.ok || !json.status) {
    throw new Error(json.message || `Paystack request failed: ${res.status}`);
  }
  return json.data;
}

export type PaystackVerifyTransactionData = {
  status: string;
  reference: string;
  amount: number;
  currency?: string;
  id?: number;
  metadata?: Record<string, unknown>;
  customer?: { email?: string };
};

export async function verifyTransaction(reference: string) {
  return paystackFetch<PaystackVerifyTransactionData>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

export type ResolveAccountData = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

export async function resolveBankAccount(bankCode: string, accountNumber: string) {
  const params = new URLSearchParams({
    account_number: accountNumber.replace(/\s/g, ""),
    bank_code: bankCode,
  });
  return paystackFetch<ResolveAccountData>(`/bank/resolve?${params.toString()}`);
}

export type ListBanksData = {
  name: string;
  slug: string;
  code: string;
  currency: string;
};

export async function listBanks(params?: { country?: string; currency?: string }) {
  const country = params?.country ?? "nigeria";
  const currency = params?.currency ?? "NGN";
  const data = await paystackFetch<ListBanksData[]>(
    `/bank?country=${country}&currency=${currency}`,
  );
  // Paystack may return multiple entries with the same bank code.
  const byCode = new Map<string, ListBanksData>();
  for (const bank of data) {
    if (!byCode.has(bank.code)) byCode.set(bank.code, bank);
  }
  return [...byCode.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export type TransferRecipientData = {
  recipient_code: string;
};

export async function createTransferRecipient(body: {
  type: "nuban";
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
}) {
  return paystackFetch<TransferRecipientData>("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "nuban",
      name: body.name,
      account_number: body.account_number.replace(/\s/g, ""),
      bank_code: body.bank_code,
      currency: body.currency ?? "NGN",
    }),
  });
}

export type TransferData = {
  transfer_code: string;
  status: string;
  amount: number;
};

export async function initiateTransfer(body: {
  source: "balance";
  amountMinorUnits: number;
  recipient: string;
  reason: string;
  reference?: string;
}) {
  return paystackFetch<TransferData>("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: body.source,
      amount: body.amountMinorUnits,
      recipient: body.recipient,
      reason: body.reason,
      reference: body.reference,
    }),
  });
}

/** Header is hex digest of HMAC SHA512 body */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader?.length) return false;
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) return false;
  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(digest, "hex");
    const b = Buffer.from(signatureHeader, "hex");
    return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
