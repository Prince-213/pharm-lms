"use client";

import { clsx } from "clsx";
import {
  Check,
  ChevronDown,
  Loader2,
  Mail,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import type { WithdrawalRequestStatus } from "@/generated/prisma/enums";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";

type BankDisplay = {
  accountName: string;
  bankCode: string;
  accountMasked: string;
  verified: boolean;
};

type WdRow = {
  id: string;
  amountMinorUnits: number;
  status: WithdrawalRequestStatus;
  requestedAt: string;
  processedAt: string | null;
  rejectReason: string | null;
  paystackTransferCode: string | null;
  mentor: { id: string; fullName: string; email: string };
  bankDisplay: BankDisplay | null;
};

const TABS: Array<{ status: WithdrawalRequestStatus | ""; label: string }> = [
  { status: "", label: "All" },
  { status: "PENDING", label: "Pending" },
  { status: "APPROVED", label: "Approved" },
  { status: "PAID", label: "Paid" },
  { status: "REJECTED", label: "Rejected" },
];

type PanelState =
  | null
  | { withdrawalId: string; phase: "menu"; left: number; top: number }
  | { withdrawalId: string; phase: "reject"; left: number; top: number };

const POPOVER_W = 300;
const POPOVER_GAP = 8;

function placePopover(anchor: DOMRect) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const left = Math.min(
    vw - POPOVER_W - 8,
    Math.max(8, anchor.right - POPOVER_W),
  );
  const top = anchor.top - POPOVER_GAP;
  return { left, top };
}

export function AdminPaymentsWithdrawalsClient() {
  const [rows, setRows] = useState<WdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WithdrawalRequestStatus | "">("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [mounted, setMounted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      const res = await fetch(`/api/admin/payments/withdrawals?${params}`);
      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.error ?? "Failed",
        );
      }
      const data = (await res.json()) as { withdrawals: WdRow[] };
      setRows(data.withdrawals);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not load withdrawals",
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
    setRejectReason("");
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, closePanel]);

  function openMenu(withdrawalId: string, anchor: HTMLElement) {
    const r = anchor.getBoundingClientRect();
    const { left, top } = placePopover(r);
    setPanel((prev) => {
      if (prev?.withdrawalId === withdrawalId && prev.phase === "menu") {
        return null;
      }
      return { withdrawalId, phase: "menu", left, top };
    });
    setRejectReason("");
  }

  function openRejectFromMenu() {
    if (!panel || panel.phase !== "menu") return;
    setPanel({
      withdrawalId: panel.withdrawalId,
      phase: "reject",
      left: panel.left,
      top: panel.top,
    });
    setRejectReason("");
  }

  const activeRow = panel
    ? (rows.find((r) => r.id === panel.withdrawalId) ?? null)
    : null;

  async function approve(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/payments/withdrawals/${id}/approve`, {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error ?? "Approve failed");
      }
      toast.success("Transfer initiated; withdrawal marked paid.");
      closePanel();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    const reason = rejectReason.trim();
    if (reason.length < 3) {
      toast.error("Rejection reason must be at least 3 characters.");
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/payments/withdrawals/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error ?? "Reject failed");
      }
      toast.success("Withdrawal rejected.");
      closePanel();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusyId(null);
    }
  }

  const popover =
    mounted && panel && activeRow
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[85] cursor-default bg-black/10"
              onClick={closePanel}
            />
            <div
              role="dialog"
              aria-label="Withdrawal actions"
              className="fixed z-[90] max-h-[min(85vh,560px)] origin-bottom overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-lg ring-1 ring-black/5"
              style={{
                left: panel.left,
                top: panel.top,
                width: POPOVER_W,
                transform: "translateY(-100%)",
              }}
            >
              {panel.phase === "menu" ? (
                <div className="px-1">
                  <p className="truncate px-2.5 pb-1.5 pt-0.5 text-xs font-semibold text-[var(--foreground)]">
                    {activeRow.mentor.fullName}
                  </p>
                  <p className="border-b border-[var(--border)] px-2.5 pb-2 text-[10px] text-muted-foreground">
                    {formatMinorUnitsToCurrency(activeRow.amountMinorUnits, "NGN")}{" "}
                    · Choose an action
                  </p>
                  <div className="max-h-[min(70vh,460px)] overflow-y-auto py-1">
                    <button
                      type="button"
                      disabled={
                        busyId === activeRow.id ||
                        !activeRow.bankDisplay?.verified
                      }
                      title={
                        !activeRow.bankDisplay?.verified
                          ? "Tutor bank account is not verified"
                          : undefined
                      }
                      onClick={() => {
                        if (
                          !confirm(
                            `Approve and pay ${formatMinorUnitsToCurrency(activeRow.amountMinorUnits, "NGN")} to ${activeRow.mentor.fullName}?`,
                          )
                        ) {
                          return;
                        }
                        void approve(activeRow.id);
                      }}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--primary-soft)] disabled:opacity-50"
                    >
                      {busyId === activeRow.id ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--primary)]" />
                      ) : (
                        <Check className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                      )}
                      Approve & pay
                    </button>
                    <button
                      type="button"
                      disabled={busyId === activeRow.id}
                      onClick={openRejectFromMenu}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-rose-800 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <X className="h-4 w-4 shrink-0" />
                      Reject withdrawal
                    </button>
                    <div className="my-1 border-t border-[var(--border)]" />
                    <a
                      href={`mailto:${encodeURIComponent(activeRow.mentor.email)}?subject=${encodeURIComponent("Withdrawal request")}&body=${encodeURIComponent(`Withdrawal ID: ${activeRow.id}\nAmount: ${formatMinorUnitsToCurrency(activeRow.amountMinorUnits, "NGN")}\n\n`)}`}
                      onClick={closePanel}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      Email tutor
                    </a>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      Reject withdrawal
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setPanel((p) =>
                          p && p.withdrawalId === activeRow.id
                            ? {
                                withdrawalId: p.withdrawalId,
                                phase: "menu",
                                left: p.left,
                                top: p.top,
                              }
                            : p,
                        )
                      }
                      className="rounded p-1 text-muted-foreground hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                      aria-label="Back"
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </button>
                  </div>
                  <p className="mb-2 line-clamp-2 text-[11px] text-muted-foreground">
                    {activeRow.mentor.fullName} ·{" "}
                    {formatMinorUnitsToCurrency(activeRow.amountMinorUnits, "NGN")}
                  </p>
                  <label className="block text-xs font-medium text-[var(--foreground)]">
                    Reason for tutor
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs"
                      placeholder="Minimum 3 characters"
                    />
                  </label>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-[var(--background)]"
                      onClick={closePanel}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={
                        busyId === activeRow.id || rejectReason.trim().length < 3
                      }
                      onClick={() => void reject(activeRow.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {busyId === activeRow.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      Confirm reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="space-y-6">
      {popover}

      <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/35 p-1">
        {TABS.map((t) => {
          const active = filter === t.status;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => setFilter(t.status)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                  : "text-muted-foreground hover:text-[var(--foreground)]",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Requested</th>
              <th className="px-4 py-3">Tutor</th>
              <th className="px-4 py-3">Bank</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Transfer</th>
              <th className="w-28 px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No withdrawals in this view.
                </td>
              </tr>
            ) : null}
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]/30"
              >
                <td className="whitespace-nowrap px-4 py-3">
                  {new Date(r.requestedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.mentor.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.mentor.email}
                  </div>
                </td>
                <td className="max-w-[200px] px-4 py-3">
                  {r.bankDisplay ? (
                    <div>
                      <div className="font-medium">
                        {r.bankDisplay.accountName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Bank code {r.bankDisplay.bankCode} ·{" "}
                        {r.bankDisplay.accountMasked}{" "}
                        {r.bankDisplay.verified ? (
                          <span className="text-primary">· Verified</span>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No account</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {formatMinorUnitsToCurrency(r.amountMinorUnits, "NGN")}
                </td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs">
                  {r.paystackTransferCode ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === "PENDING" ? (
                    <button
                      type="button"
                      aria-expanded={panel?.withdrawalId === r.id}
                      aria-haspopup="dialog"
                      onClick={(e) => openMenu(r.id, e.currentTarget)}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm transition",
                        panel?.withdrawalId === r.id
                          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--background)]",
                      )}
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden />
                      Actions
                      <ChevronDown
                        className="h-3.5 w-3.5 opacity-70"
                        aria-hidden
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {r.rejectReason ? `Reason: ${r.rejectReason}` : "—"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
