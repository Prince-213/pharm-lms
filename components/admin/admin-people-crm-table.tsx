"use client";

import { clsx } from "clsx";
import {
  Check,
  Copy,
  Loader2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Search,
  Trash2,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminSendUserMessageAction } from "@/app/actions/chat";
import {
  deleteUserAsAdminAction,
  setUserActiveAction,
} from "@/app/admin/people/actions";

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

const DELETE_PHRASE = "DELETE";

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
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dmDraft, setDmDraft] = useState("");
  const [deleteStep, setDeleteStep] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [pending, startTransition] = useTransition();
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status === "active" && !r.isActive) return false;
      if (status === "inactive" && r.isActive) return false;
      if (!term) return true;
      return `${r.fullName} ${r.email} ${r.id}`.toLowerCase().includes(term);
    });
  }, [rows, search, status]);

  const menuUser = menuUserId
    ? rows.find((r) => r.id === menuUserId)
    : undefined;

  useEffect(() => {
    if (!menuUserId) return;
    function onDocClick(e: MouseEvent) {
      if (!popoverRef.current?.contains(e.target as Node)) {
        setMenuUserId(null);
        setDeleteStep(false);
        setDeleteConfirmText("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuUserId]);

  function openMenu(userId: string) {
    setMenuUserId((id) => (id === userId ? null : userId));
    setDeleteStep(false);
    setDeleteConfirmText("");
    setDmDraft("");
    setError(null);
    setMessage(null);
  }

  function toggleActive(userId: string, next: boolean) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await setUserActiveAction(userId, next, role);
      if ("error" in res) setError(res.error ?? "Could not update user.");
      else {
        setMessage(next ? "Account activated." : "Account deactivated.");
        setMenuUserId(null);
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

  function sendDm(recipientId: string) {
    const body = dmDraft.trim();
    if (!body) {
      setError("Enter a message to send.");
      return;
    }
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await adminSendUserMessageAction({ recipientId, body });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setDmDraft("");
      setMenuUserId(null);
      router.push(`/admin/messages?thread=${res.threadId}`);
    });
  }

  function confirmDelete(userId: string) {
    if (deleteConfirmText.trim() !== DELETE_PHRASE) {
      setError(`Type ${DELETE_PHRASE} to confirm permanent deletion.`);
      return;
    }
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await deleteUserAsAdminAction(userId, role);
      if ("error" in res) {
        setError(res.error ?? "Could not delete user.");
        return;
      }
      setMenuUserId(null);
      setDeleteStep(false);
      setDeleteConfirmText("");
      setMessage("Account and related data were removed.");
      router.refresh();
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
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-100">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900 ring-1 ring-rose-100">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">
                  {rows[0]?.primaryMetricLabel ?? "Metric"}
                </th>
                <th className="px-4 py-3">Joined</th>
                <th className="w-28 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-[var(--muted)]"
                  >
                    No records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">
                        {u.fullName}
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--muted)]">
                        ID: {u.id}
                      </p>
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
                      <p className="tabular-nums text-[var(--foreground)]">
                        {u.primaryMetricValue}
                      </p>
                      {u.secondaryMetricLabel &&
                      typeof u.secondaryMetricValue === "number" ? (
                        <p className="text-xs text-[var(--muted)]">
                          {u.secondaryMetricLabel}: {u.secondaryMetricValue}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {new Date(u.createdAtIso).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      <div
                        className={clsx(
                          "relative inline-block text-right",
                          menuUserId === u.id && "z-40",
                        )}
                        ref={menuUserId === u.id ? popoverRef : undefined}
                      >
                        <button
                          type="button"
                          onClick={() => openMenu(u.id)}
                          className={clsx(
                            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition",
                            menuUserId === u.id
                              ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                              : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background)]",
                          )}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          Manage
                        </button>

                        {menuUserId === u.id && menuUser ? (
                          <div className="absolute right-0 top-full z-50 mt-1 w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-left shadow-xl">
                          <p className="font-semibold text-[var(--foreground)]">
                            {menuUser.fullName}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {menuUser.email}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                            <button
                              type="button"
                              onClick={() =>
                                toggleActive(menuUser.id, !menuUser.isActive)
                              }
                              disabled={pending}
                              className={clsx(
                                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60 min-w-[7rem]",
                                menuUser.isActive
                                  ? "bg-rose-600 hover:bg-rose-700"
                                  : "bg-emerald-600 hover:bg-emerald-700",
                              )}
                            >
                              {pending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : menuUser.isActive ? (
                                <UserX className="h-3.5 w-3.5" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              {menuUser.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <a
                              href={`mailto:${encodeURIComponent(menuUser.email)}?subject=${encodeURIComponent(`${title.replace(/s$/i, "")} account`)}`}
                              className="inline-flex items-center justify-center gap-1 rounded-md border border-[var(--border)] px-2 py-1.5 text-[11px] font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Email
                            </a>
                            <button
                              type="button"
                              onClick={() => copyUserId(menuUser.id)}
                              className="inline-flex items-center justify-center gap-1 rounded-md border border-[var(--border)] px-2 py-1.5 text-[11px] font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              {copiedId === menuUser.id ? "Copied" : "Copy ID"}
                            </button>
                          </div>

                          <div className="mt-3 border-t border-[var(--border)] pt-3">
                            <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                              <MessageSquare className="h-3 w-3" />
                              In-app message
                            </p>
                            <textarea
                              value={dmDraft}
                              onChange={(e) => setDmDraft(e.target.value)}
                              placeholder="Opens admin Messages after send…"
                              rows={3}
                              className="mb-2 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
                              disabled={pending}
                            />
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => sendDm(menuUser.id)}
                              className="w-full rounded-md bg-[var(--primary)] py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
                            >
                              Send &amp; open thread
                            </button>
                          </div>

                          <div className="mt-3 border-t border-[var(--border)] pt-3">
                            {!deleteStep ? (
                              <button
                                type="button"
                                disabled={pending}
                                onClick={() => {
                                  setDeleteStep(true);
                                  setDeleteConfirmText("");
                                  setError(null);
                                }}
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-60"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete account &amp; data
                              </button>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-[11px] leading-snug text-rose-900">
                                  Permanently removes login, enrollments,
                                  progress, and — for tutors — all authored
                                  courses and their content. Type{" "}
                                  <strong>{DELETE_PHRASE}</strong> to confirm.
                                </p>
                                <input
                                  type="text"
                                  value={deleteConfirmText}
                                  onChange={(e) =>
                                    setDeleteConfirmText(e.target.value)
                                  }
                                  placeholder={DELETE_PHRASE}
                                  className="w-full rounded-md border border-[var(--border)] px-2 py-1.5 text-xs"
                                  disabled={pending}
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    disabled={pending}
                                    onClick={() => confirmDelete(menuUser.id)}
                                    className="flex-1 rounded-md bg-rose-600 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
                                  >
                                    {pending ? (
                                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                    ) : (
                                      "Confirm delete"
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={pending}
                                    onClick={() => {
                                      setDeleteStep(false);
                                      setDeleteConfirmText("");
                                    }}
                                    className="rounded-md border border-[var(--border)] px-2 py-1.5 text-xs font-semibold"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
