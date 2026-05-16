"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import type { TutorWalletBalances } from "@/lib/payments/tutor-wallet";

type PayoutAccount = {
  bankCode: string;
  bankName: string | null;
  accountNumber: string;
  accountName: string;
  verifiedAt: string | null;
} | null;

type WithdrawalRow = {
  id: string;
  amountMinorUnits: number;
  status: string;
  requestedAt: string;
  processedAt: string | null;
  rejectReason: string | null;
};

export function TutorPayoutsClient({
  initialWallet,
  initialAccount,
  initialWithdrawals,
  minWithdrawalMinorUnits,
  settlementNote,
}: {
  initialWallet: TutorWalletBalances;
  initialAccount: PayoutAccount;
  initialWithdrawals: WithdrawalRow[];
  minWithdrawalMinorUnits: number;
  settlementNote: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [wallet, setWallet] = useState(initialWallet);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [account, setAccount] = useState<PayoutAccount>(initialAccount);
  const [withdrawNaira, setWithdrawNaira] = useState("");

  function refresh() {
    void Promise.all([
      fetch("/api/tutor/wallet").then((r) => r.json()),
      fetch("/api/tutor/withdrawals").then((r) => r.json()),
      fetch("/api/tutor/payout-account").then((r) => r.json()),
    ]).then(([w, wd, acc]) => {
      if (w?.availableMinor != null) setWallet(w as TutorWalletBalances);
      if (wd?.withdrawals) setWithdrawals(wd.withdrawals as WithdrawalRow[]);
      if (acc) setAccount(acc.account as PayoutAccount);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Payouts
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Your course earnings and bank payouts (processed by admin after you
          request).
        </p>
        {settlementNote ? (
          <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--primary-soft)]/40 p-3 text-xs leading-relaxed text-[var(--foreground)]">
            {settlementNote}
          </p>
        ) : null}
      </header>

      <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          Wallet
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-[var(--surface-muted)] p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">
              Available
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {formatMinorUnitsToCurrency(wallet.availableMinor, "NGN")}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">
              Lifetime earned (net)
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">
              {formatMinorUnitsToCurrency(wallet.lifetimeEarnedMinor, "NGN")}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-4">
            <p className="text-xs text-[var(--muted)]">Pending / reserved</p>
            <p className="mt-1 font-semibold tabular-nums">
              {formatMinorUnitsToCurrency(wallet.reservedMinor, "NGN")}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-4">
            <p className="text-xs text-[var(--muted)]">Paid out</p>
            <p className="mt-1 font-semibold tabular-nums">
              {formatMinorUnitsToCurrency(wallet.lifetimeWithdrawnMinor, "NGN")}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          Payout account
        </h2>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Withdrawals are sent to the bank account saved in your profile.
        </p>
        {account?.verifiedAt ? (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4">
            <p className="font-semibold">{account.accountName}</p>
            <p className="text-sm text-[var(--muted)]">
              {account.bankName ?? account.bankCode} · {account.accountNumber}
            </p>
            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
              Verified
            </span>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/30 p-4">
            <p className="text-sm text-[var(--muted)]">
              {account
                ? "Your payout account is not verified yet."
                : "No payout account on file yet."}
            </p>
            <Link
              href="/tutor/profile?tab=accounts"
              className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
            >
              {account ? "Update in profile" : "Add bank account in profile"}
            </Link>
          </div>
        )}
        {account?.verifiedAt ? (
          <Link
            href="/tutor/profile?tab=accounts"
            className="mt-3 inline-block text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            Change payout account in profile
          </Link>
        ) : null}
      </section>

      <section
        id="request"
        className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm"
      >
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          Request withdrawal
        </h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Minimum withdrawal:{" "}
          {formatMinorUnitsToCurrency(minWithdrawalMinorUnits, "NGN")}
        </p>
        <div className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="withdraw-amount-naira"
              className="mb-1 block text-xs font-semibold"
            >
              Amount (Naira)
            </label>
            <input
              id="withdraw-amount-naira"
              value={withdrawNaira}
              onChange={(e) =>
                setWithdrawNaira(e.target.value.replace(/[^\d]/g, ""))
              }
              className="h-10 w-full border border-[var(--border)] bg-white px-3 text-sm"
              inputMode="numeric"
              placeholder="e.g. 10000"
            />
          </div>
          <button
            type="button"
            disabled={pending || !withdrawNaira || !account?.verifiedAt}
            onClick={() => {
              const n = Math.floor(Number.parseInt(withdrawNaira, 10) || 0);
              const minor = n * 100;
              startTransition(async () => {
                const res = await fetch("/api/tutor/withdrawals", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amountMinorUnits: minor }),
                });
                const j = (await res.json()) as { error?: string };
                if (!res.ok) {
                  toast.error(j.error ?? "Request failed");
                  return;
                }
                toast.success("Withdrawal requested.");
                setWithdrawNaira("");
                refresh();
              });
            }}
            className="h-10 rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Submit request
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-sm font-bold text-[var(--foreground)]">
            Withdrawal history
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-xs font-semibold uppercase text-[var(--muted)]">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-[var(--muted)]"
                  >
                    No withdrawals yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-[var(--border)]/60">
                    <td className="px-6 py-3 text-xs">
                      {new Date(w.requestedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-semibold tabular-nums">
                      {formatMinorUnitsToCurrency(w.amountMinorUnits, "NGN")}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-semibold">{w.status}</span>
                      {w.rejectReason ? (
                        <p className="mt-1 text-[11px] text-rose-700">
                          {w.rejectReason}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
