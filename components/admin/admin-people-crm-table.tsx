"use client";

import { clsx } from "clsx";
import { Check, Copy, Loader2, Mail, MoreHorizontal, Search, UserX } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserActiveAction } from "@/app/admin/people/actions";

export type AdminPersonRow = {
  id: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "TUTOR" | "MENTOR";
  isActive: boolean;
  createdAtIso: string;
  primaryMetricLabel: string;
  primaryMetricValue: number;
  secondaryMetricLabel?: string;
  secondaryMetricValue?: number;
};

type StatusFilter = "all" | "active" | "inactive";

export function AdminPeopleCrmTable({
  title,
  role,
  rows,
}: {
  title: string;
  role: "STUDENT" | "TUTOR" | "MENTOR";
  rows: AdminPersonRow[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status === "active" && !r.isActive) return false;
      if (status === "inactive" && r.isActive) return false;
      if (!term) return true;
      return `${r.fullName} ${r.email} ${r.id}`.toLowerCase().includes(term);
    });
  }, [rows, search, status]);

  async function toggleActive(userId: string, next: boolean) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await setUserActiveAction(userId, next, role);
      if ("error" in res) setError(res.error ?? "Could not update user.");
      else {
        setMessage(next ? "Account activated." : "Account deactivated.");
        setSelectedId(null);
        router.refresh();
      }
    });
  }

  function copyUserId(userId: string) {
    void navigator.clipboard.writeText(userId).then(() => {
      setCopiedId(userId);
      setTimeout(() => setCopiedId((id) => (id === userId ? null : id)), 1800);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-3">
        <label className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()} by name, email, or ID`}
            className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm"
          />
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-100">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">{rows[0]?.primaryMetricLabel ?? "Metric"}</th>
                <th className="px-4 py-3">Joined</th>
                <th className="w-24 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[var(--muted)]">
                    No records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">{u.fullName}</p>
                      <p className="mt-1 text-[11px] text-[var(--muted)]">ID: {u.id}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "rounded-full px-2 py-0.5 text-xs font-semibold ring-1",
                          u.isActive
                            ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                            : "bg-rose-50 text-rose-900 ring-rose-200",
                        )}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="tabular-nums text-[var(--foreground)]">{u.primaryMetricValue}</p>
                      {u.secondaryMetricLabel && typeof u.secondaryMetricValue === "number" ? (
                        <p className="text-xs text-[var(--muted)]">
                          {u.secondaryMetricLabel}: {u.secondaryMetricValue}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {new Date(u.createdAtIso).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId((id) => (id === u.id ? null : u.id))}
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition",
                          selectedId === u.id
                            ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                            : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)]",
                        )}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          {(() => {
            const active = rows.find((r) => r.id === selectedId);
            if (!active) return null;
            return (
              <>
                <div className="mb-3">
                  <p className="font-semibold text-[var(--foreground)]">{active.fullName}</p>
                  <p className="text-xs text-[var(--muted)]">{active.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(active.id, !active.isActive)}
                    disabled={pending}
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60",
                      active.isActive ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700",
                    )}
                  >
                    {pending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : active.isActive ? (
                      <UserX className="h-3.5 w-3.5" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    {active.isActive ? "Deactivate account" : "Activate account"}
                  </button>
                  <a
                    href={`mailto:${encodeURIComponent(active.email)}?subject=${encodeURIComponent(`${title.slice(0, -1)} account`)}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--background)]"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
                  <button
                    type="button"
                    onClick={() => copyUserId(active.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--background)]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedId === active.id ? "ID copied" : "Copy user ID"}
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}
