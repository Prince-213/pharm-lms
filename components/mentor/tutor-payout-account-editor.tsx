"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { TutorPayoutSummary } from "@/app/tutor/profile/types";

type Bank = { name: string; code: string; slug: string };

export function TutorPayoutAccountEditor({
  payoutSummary,
  onSaved,
}: {
  payoutSummary: TutorPayoutSummary | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/tutor/banks")
      .then((r) => r.json())
      .then((d: { banks?: Bank[] }) => {
        if (Array.isArray(d.banks)) setBanks(d.banks);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      {payoutSummary ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Current account · {payoutSummary.accountName}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Bank code {payoutSummary.bankCode} · {payoutSummary.accountMasked}
          </p>
          {payoutSummary.verified ? (
            <span className="mt-2 inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Verified
            </span>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-[var(--muted)]">
        Use a personal bank account that matches your legal name. We verify with
        your bank before saving. Request withdrawals from the Payouts page after
        this is saved.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="payout-bank" className="mb-1 block text-xs font-semibold">
            Bank
          </label>
          <select
            id="payout-bank"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm"
          >
            <option value="">— Choose bank —</option>
            {banks.map((b) => (
              <option key={b.slug} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="payout-account-number"
            className="mb-1 block text-xs font-semibold"
          >
            Account number
          </label>
          <input
            id="payout-account-number"
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, ""))
            }
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            inputMode="numeric"
            maxLength={10}
          />
        </div>
      </div>

      {resolvedName ? (
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Account name: {resolvedName}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || !bankCode || accountNumber.length < 10}
          onClick={() => {
            setResolvedName(null);
            startTransition(async () => {
              const res = await fetch("/api/tutor/payout-account/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bankCode, accountNumber }),
              });
              const j = (await res.json()) as {
                accountName?: string;
                error?: string;
              };
              if (!res.ok) {
                toast.error(j.error ?? "Could not verify account");
                return;
              }
              setResolvedName(j.accountName ?? null);
              toast.success("Account verified. Save to confirm.");
            });
          }}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold"
        >
          Verify account
        </button>
        <button
          type="button"
          disabled={pending || !resolvedName}
          onClick={() => {
            startTransition(async () => {
              const bankLabel =
                banks.find((b) => b.code === bankCode)?.name ?? null;
              const res = await fetch("/api/tutor/payout-account", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bankCode,
                  bankName: bankLabel,
                  accountNumber,
                  accountName: resolvedName,
                }),
              });
              const j = (await res.json()) as { error?: string };
              if (!res.ok) {
                toast.error(j.error ?? "Could not save");
                return;
              }
              toast.success("Payout account saved.");
              setResolvedName(null);
              setBankCode("");
              setAccountNumber("");
              router.refresh();
              onSaved?.();
            });
          }}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
        >
          Save bank details
        </button>
      </div>
    </div>
  );
}
