"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CoursePurchaseStatus } from "@/generated/prisma/enums";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";

type TxRow = {
  id: string;
  courseId: string;
  amountMinorUnits: number;
  currency: string;
  platformFeeMinorUnits: number;
  netToMentorMinorUnits: number;
  status: CoursePurchaseStatus;
  paystackReference: string;
  paidAt: string | null;
  createdAt: string;
  course: { title: string };
  mentor: { id: string; fullName: string };
  studentEmailMasked: string;
};

const STATUS_OPTIONS: Array<CoursePurchaseStatus | ""> = [
  "",
  "PENDING",
  "SUCCESS",
  "FAILED",
];

export function AdminPaymentsTransactionsClient() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [mentorId, setMentorId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (mentorId.trim()) params.set("mentorId", mentorId.trim());
      if (courseId.trim()) params.set("courseId", courseId.trim());
      if (from.trim()) params.set("from", new Date(from.trim()).toISOString());
      if (to.trim()) params.set("to", new Date(to.trim()).toISOString());
      params.set("take", "100");
      const res = await fetch(`/api/admin/payments/transactions?${params}`);
      if (!res.ok) {
        throw new Error(
          (await res.json().catch(() => null))?.error ?? "Failed",
        );
      }
      const data = (await res.json()) as { transactions: TxRow[] };
      setRows(data.transactions);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not load transactions",
      );
    } finally {
      setLoading(false);
    }
  }, [status, mentorId, courseId, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="tx-status">Status</Label>
          <select
            id="tx-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "All"}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tx-mentor">Tutor user ID</Label>
          <Input
            id="tx-mentor"
            value={mentorId}
            onChange={(e) => setMentorId(e.target.value)}
            placeholder="Optional mentor id"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tx-course">Course ID</Label>
          <Input
            id="tx-course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Optional course id"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tx-from">From (created)</Label>
          <Input
            id="tx-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tx-to">To (created)</Label>
          <Input
            id="tx-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="default"
            className="w-full sm:w-auto"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? "Loading…" : "Apply filters"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  No transactions match these filters.
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {r.paidAt
                    ? new Date(r.paidAt).toLocaleString()
                    : new Date(r.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-medium">
                  {r.course.title}
                </TableCell>
                <TableCell className="max-w-[140px] truncate text-sm">
                  {r.mentor.fullName}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {r.studentEmailMasked}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatMinorUnitsToCurrency(
                    r.amountMinorUnits,
                    r.currency ?? "NGN",
                  )}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatMinorUnitsToCurrency(
                    r.platformFeeMinorUnits,
                    r.currency ?? "NGN",
                  )}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {formatMinorUnitsToCurrency(
                    r.netToMentorMinorUnits,
                    r.currency ?? "NGN",
                  )}
                </TableCell>
                <TableCell className="text-sm">{r.status}</TableCell>
                <TableCell className="max-w-[120px] truncate font-mono text-xs">
                  {r.paystackReference}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
