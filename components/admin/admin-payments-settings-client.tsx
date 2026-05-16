"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ProfileSegment } from "@/components/profile/profile-editor-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AdminPaymentsSettingsClient() {
  const [feePercent, setFeePercent] = useState(0);
  const [minWithdrawalNaira, setMinWithdrawalNaira] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/platform-settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = (await res.json()) as {
          platformFeePercent: number;
          minWithdrawalMinorUnits: number;
          paystackSettlementNote: string | null;
        };
        if (cancelled) return;
        setFeePercent(data.platformFeePercent);
        setMinWithdrawalNaira(Math.round(data.minWithdrawalMinorUnits / 100));
        setNote(data.paystackSettlementNote ?? "");
      } catch {
        if (!cancelled) toast.error("Could not load platform settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function save() {
    const tid = toast.loading("Saving…");
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/platform-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platformFeePercent: feePercent,
            minWithdrawalMinorUnits: Math.max(0, minWithdrawalNaira) * 100,
            paystackSettlementNote: note.trim() || null,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.error ?? "Save failed");
        }
        toast.success("Settings saved.", { id: tid });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed.", {
          id: tid,
        });
      }
    });
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading settings…</p>;
  }

  return (
    <ProfileSegment
      title="Platform payments"
      description="Fee withheld from each successful sale and rules for tutor withdrawals."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="platform-fee">Platform fee (%)</Label>
          <Input
            id="platform-fee"
            type="number"
            min={0}
            max={100}
            value={feePercent}
            onChange={(e) => setFeePercent(Number(e.target.value))}
            className="h-11"
          />
          <p className="text-xs text-[var(--muted)]">
            Applied when a purchase is verified; stored on each transaction row.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="min-wd">Minimum withdrawal (₦)</Label>
          <Input
            id="min-wd"
            type="number"
            min={0}
            step={1}
            value={minWithdrawalNaira}
            onChange={(e) => setMinWithdrawalNaira(Number(e.target.value))}
            className="h-11"
          />
          <p className="text-xs text-[var(--muted)]">
            Whole naira; tutors cannot request less than this amount.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sla-note">Payout SLA note (shown to tutors)</Label>
        <Textarea
          id="sla-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. Withdrawals are processed within 3–5 business days."
          className="min-h-[100px] rounded-md border-[var(--border)] bg-[var(--background)]"
        />
      </div>
      <div className="flex justify-end border-t border-[var(--border)] pt-4">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </ProfileSegment>
  );
}
