"use client";

import { clsx } from "clsx";
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { sendChatMessageAction } from "@/app/actions/chat";
import { EmptyState } from "@/components/ui/empty-state";
import { adminDeleteUserAndData, setUserActiveAction } from "@/app/admin/people/actions";
import {
  mentorAccountDisplayLabel,
  mentorNeedsAdminActivation,
  type MentorAccountDisplayStatus,
} from "@/lib/auth/mentor-account-status";
import {
  tutorAccountDisplayLabel,
  type TutorAccountDisplayStatus,
} from "@/lib/auth/tutor-profile-completion";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";

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
  /** Mentor lifecycle status for CRM badges/filters. */
  mentorAccountStatus?: MentorAccountDisplayStatus;
  mentorProfileStatus?: string;
  /** Tutor lifecycle status for CRM badges/filters. */
  tutorAccountStatus?: TutorAccountDisplayStatus;
  tutorProfileCompletedAtIso?: string | null;
  mentorProfile?: {
    mentorHeadline: string | null;
    mentorSpecialties: string | null;
    mentorYearsExperience: number | null;
    phoneNumber: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    postalCode: string | null;
    websiteUrl: string | null;
    linkedinUrl: string | null;
    bio: string | null;
    avatarUrl: string | null;
    mentorProfileSubmittedAtIso: string | null;
  };
};

type StatusFilter =
  | "all"
  | "active"
  | "inactive"
  | "pending_activation"
  | "incomplete"
  | "rejected";

type PanelState =
  | null
  | { userId: string; phase: "menu"; left: number; top: number }
  | { userId: string; phase: "delete"; left: number; top: number };

const POPOVER_W = 320;
const POPOVER_GAP = 8;

function placePopover(anchor: DOMRect) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const left = Math.min(vw - POPOVER_W - 8, Math.max(8, anchor.right - POPOVER_W));
  const top = anchor.top - POPOVER_GAP;
  return { left, top };
}

function personStatusLabel(row: AdminPersonRow): string {
  if (row.role === "MENTOR" && row.mentorAccountStatus) {
    return mentorAccountDisplayLabel(row.mentorAccountStatus);
  }
  if (row.role === "TUTOR" && row.tutorAccountStatus) {
    return tutorAccountDisplayLabel(row.tutorAccountStatus);
  }
  return row.isActive ? "Active" : "Inactive";
}

function personStatusBadgeClass(row: AdminPersonRow): string {
  const status =
    row.role === "MENTOR"
      ? row.mentorAccountStatus
      : row.role === "TUTOR"
        ? row.tutorAccountStatus
        : row.isActive
          ? "active"
          : "inactive";

  switch (status) {
    case "pending_activation":
      return "bg-amber-50 text-amber-950 ring-amber-200";
    case "incomplete":
      return "bg-slate-100 text-slate-800 ring-slate-200";
    case "rejected":
      return "bg-orange-50 text-orange-900 ring-orange-200";
    case "inactive":
      return "bg-rose-50 text-rose-900 ring-rose-200";
    case "active":
    default:
      return "bg-primary/10 text-primary ring-primary/20";
  }
}

function matchesStatusFilter(row: AdminPersonRow, status: StatusFilter): boolean {
  if (status === "all") return true;

  if (row.role === "MENTOR" && row.mentorAccountStatus) {
    return row.mentorAccountStatus === status;
  }
  if (row.role === "TUTOR" && row.tutorAccountStatus) {
    if (status === "active") return row.tutorAccountStatus === "active";
    if (status === "inactive") return row.tutorAccountStatus === "inactive";
    if (status === "incomplete") return row.tutorAccountStatus === "incomplete";
    return false;
  }

  if (status === "active") return row.isActive;
  if (status === "inactive") return !row.isActive;
  return false;
}

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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [panel, setPanel] = useState<PanelState>(null);
  const [mounted, setMounted] = useState(false);
  const [dmBody, setDmBody] = useState("");
  const [lastThreadId, setLastThreadId] = useState<string | null>(null);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanel(null);
    setDmBody("");
    setLastThreadId(null);
    setDeleteEmailConfirm("");
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, closePanel]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!matchesStatusFilter(r, status)) return false;
      if (!term) return true;
      return `${r.fullName} ${r.email} ${r.id}`.toLowerCase().includes(term);
    });
  }, [rows, search, status]);

  const activePerson = panel ? rows.find((r) => r.id === panel.userId) ?? null : null;
  const mentorProfile = activePerson?.role === "MENTOR" ? activePerson.mentorProfile ?? null : null;
  const needsMentorActivation =
    activePerson?.role === "MENTOR" &&
    activePerson.mentorAccountStatus &&
    mentorNeedsAdminActivation(activePerson.mentorAccountStatus);

  function openMenu(userId: string, anchor: HTMLElement) {
    const r = anchor.getBoundingClientRect();
    const { left, top } = placePopover(r);
    setPanel((prev) => {
      if (prev?.userId === userId && prev.phase === "menu") return null;
      return { userId, phase: "menu", left, top };
    });
    setDmBody("");
    setLastThreadId(null);
    setDeleteEmailConfirm("");
    setError(null);
    setMessage(null);
  }

  function openDeleteFromMenu() {
    if (!panel || panel.phase !== "menu") return;
    setPanel({ userId: panel.userId, phase: "delete", left: panel.left, top: panel.top });
    setDeleteEmailConfirm("");
  }

  function backToMenu() {
    if (!panel) return;
    setPanel({ userId: panel.userId, phase: "menu", left: panel.left, top: panel.top });
    setDeleteEmailConfirm("");
  }

  async function toggleActive(userId: string, next: boolean) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await setUserActiveAction(userId, next, role);
      if ("error" in res) setError(res.error ?? "Could not update user.");
      else {
        setMessage(
          next
            ? role === "MENTOR"
              ? "Mentor activated and approved for student listing."
              : "Account activated."
            : "Account deactivated.",
        );
        closePanel();
        refreshPortalAfterMutation(router);
      }
    });
  }

  function sendDm() {
    if (!activePerson || !dmBody.trim()) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await sendChatMessageAction({
        recipientId: activePerson.id,
        body: dmBody.trim(),
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setMessage("Message sent.");
      setDmBody("");
      setLastThreadId(res.threadId);
      refreshPortalAfterMutation(router);
    });
  }

  function runDelete() {
    if (!activePerson) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await adminDeleteUserAndData(activePerson.id, role, deleteEmailConfirm);
      if ("error" in res) {
        setError(res.error ?? "Could not delete user.");
        return;
      }
      setMessage("Account and related data were permanently removed.");
      closePanel();
      refreshPortalAfterMutation(router);
    });
  }

  function copyUserId(userId: string) {
    void navigator.clipboard.writeText(userId).then(() => {
      setCopiedId(userId);
      setTimeout(() => setCopiedId((id) => (id === userId ? null : id)), 1800);
    });
  }

  const popover =
    mounted && panel && activePerson
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
              aria-label="User actions"
              className="fixed z-[90] max-h-[min(85vh,620px)] w-[320px] origin-bottom overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-lg ring-1 ring-black/5"
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
                    {activePerson.fullName}
                  </p>
                  <p className="border-b border-[var(--border)] px-2.5 pb-2 text-[10px] text-muted-foreground">
                    {activePerson.email}
                  </p>
                  <div className="max-h-[min(72vh,520px)] overflow-y-auto py-1">
                    <div className="px-2.5 pb-2 pt-1">
                      {mentorProfile ? (
                        <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Mentor profile
                          </p>
                          <p className="mt-1.5 text-[11px] font-semibold text-[var(--foreground)]">
                            Status: {personStatusLabel(activePerson)}
                          </p>
                          <div className="mt-2 grid gap-1 text-xs text-[var(--foreground)]">
                            {mentorProfile.mentorProfileSubmittedAtIso ? (
                              <p className="text-[11px] text-muted-foreground">
                                Submitted:{" "}
                                {new Date(mentorProfile.mentorProfileSubmittedAtIso).toLocaleString()}
                              </p>
                            ) : (
                              <p className="text-[11px] text-muted-foreground">
                                Not submitted yet
                              </p>
                            )}
                            {mentorProfile.mentorHeadline ? (
                              <p className="font-medium">{mentorProfile.mentorHeadline}</p>
                            ) : null}
                            {mentorProfile.mentorYearsExperience !== null ? (
                              <p className="text-[11px] text-muted-foreground">
                                Experience: {mentorProfile.mentorYearsExperience} years
                              </p>
                            ) : null}
                            {mentorProfile.mentorSpecialties ? (
                              <p className="text-[11px] text-muted-foreground">
                                Specialties: {mentorProfile.mentorSpecialties}
                              </p>
                            ) : null}
                            {mentorProfile.phoneNumber ? (
                              <p className="text-[11px] text-muted-foreground">
                                Phone: {mentorProfile.phoneNumber}
                              </p>
                            ) : null}
                            {mentorProfile.country || mentorProfile.state || mentorProfile.city ? (
                              <p className="text-[11px] text-muted-foreground">
                                Location: {[mentorProfile.city, mentorProfile.state, mentorProfile.country]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            ) : null}
                            {mentorProfile.addressLine1 ? (
                              <p className="text-[11px] text-muted-foreground">
                                Address: {mentorProfile.addressLine1}
                                {mentorProfile.addressLine2 ? `, ${mentorProfile.addressLine2}` : ""}
                                {mentorProfile.postalCode ? ` (${mentorProfile.postalCode})` : ""}
                              </p>
                            ) : null}
                            {mentorProfile.linkedinUrl ? (
                              <a
                                className="text-[11px] font-semibold text-[var(--primary-strong)] hover:underline"
                                href={mentorProfile.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                LinkedIn
                              </a>
                            ) : null}
                            {mentorProfile.websiteUrl ? (
                              <a
                                className="text-[11px] font-semibold text-[var(--primary-strong)] hover:underline"
                                href={mentorProfile.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Website
                              </a>
                            ) : null}
                            <p className="mt-1 line-clamp-5 text-[11px] text-muted-foreground">
                              {mentorProfile.bio?.trim() || "No bio provided."}
                            </p>
                          </div>
                          {needsMentorActivation ? (
                            <Link
                              href="/admin/mentor-applications"
                              onClick={closePanel}
                              className="mt-2 block text-[11px] font-semibold text-[var(--primary-strong)] hover:underline"
                            >
                              Open applications queue
                            </Link>
                          ) : null}
                        </div>
                      ) : null}

                      {activePerson.role === "TUTOR" ? (
                        <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Tutor profile
                          </p>
                          <p className="mt-1.5 text-[11px] font-semibold text-[var(--foreground)]">
                            Status: {personStatusLabel(activePerson)}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {activePerson.tutorProfileCompletedAtIso
                              ? `Completed: ${new Date(activePerson.tutorProfileCompletedAtIso).toLocaleString()}`
                              : "Required fields not complete yet — tutors auto-activate when the profile is saved complete."}
                          </p>
                        </div>
                      ) : null}

                      <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        In-app message
                      </label>
                      <textarea
                        value={dmBody}
                        onChange={(e) => setDmBody(e.target.value)}
                        rows={3}
                        maxLength={4000}
                        placeholder="Write a direct message…"
                        className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        disabled={pending || !dmBody.trim()}
                        onClick={sendDm}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {pending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <MessageSquare className="h-3.5 w-3.5" />
                        )}
                        Send message
                      </button>
                      {lastThreadId ? (
                        <Link
                          href={`/admin/messages?thread=${lastThreadId}`}
                          onClick={closePanel}
                          className="mt-2 block text-center text-xs font-semibold text-[var(--primary-strong)] hover:underline"
                        >
                          Open in inbox
                        </Link>
                      ) : null}
                    </div>

                    <div className="my-1 border-t border-[var(--border)]" />

                    {needsMentorActivation ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleActive(activePerson.id, true)}
                        className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
                      >
                        {pending ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4 shrink-0" />
                        )}
                        Activate mentor
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleActive(activePerson.id, !activePerson.isActive)}
                        className={clsx(
                          "flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium disabled:opacity-50",
                          activePerson.isActive
                            ? "text-rose-800 hover:bg-rose-50"
                            : "text-primary hover:bg-primary/10",
                        )}
                      >
                        {pending ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : activePerson.isActive ? (
                          <UserX className="h-4 w-4 shrink-0" />
                        ) : (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                        {activePerson.isActive ? "Deactivate account" : "Activate account"}
                      </button>
                    )}

                    {needsMentorActivation ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleActive(activePerson.id, false)}
                        className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-rose-800 hover:bg-rose-50 disabled:opacity-50"
                      >
                        {pending ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4 shrink-0" />
                        )}
                        Deactivate account
                      </button>
                    ) : null}

                    <a
                      href={`mailto:${encodeURIComponent(activePerson.email)}?subject=${encodeURIComponent(`${title.slice(0, -1)} account`)}`}
                      onClick={closePanel}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      Email
                    </a>

                    <button
                      type="button"
                      onClick={() => copyUserId(activePerson.id)}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    >
                      <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {copiedId === activePerson.id ? "ID copied" : "Copy user ID"}
                    </button>

                    <div className="my-1 border-t border-[var(--border)]" />

                    <button
                      type="button"
                      onClick={openDeleteFromMenu}
                      className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm font-medium text-rose-800 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      Delete account and data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[var(--foreground)]">Delete account</p>
                    <button
                      type="button"
                      onClick={backToMenu}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-[var(--background)]"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Permanently removes login access and related activity
                    {role === "TUTOR" ? ", including every course they own and learner data for those courses" : ""}
                    . This cannot be undone.
                  </p>
                  <label className="mt-3 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Type email to confirm
                  </label>
                  <input
                    value={deleteEmailConfirm}
                    onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                    autoComplete="off"
                    placeholder={activePerson.email}
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    disabled={
                      pending ||
                      deleteEmailConfirm.trim().toLowerCase() !== activePerson.email.toLowerCase()
                    }
                    onClick={runDelete}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Delete permanently
                  </button>
                </div>
              )}
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-3">
        <label className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
          {role === "MENTOR" ? (
            <>
              <option value="pending_activation">Pending activation</option>
              <option value="incomplete">Setup incomplete</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </>
          ) : role === "TUTOR" ? (
            <>
              <option value="incomplete">Setup incomplete</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </>
          ) : (
            <>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </>
          )}
        </select>
      </div>

      {message ? (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary ring-1 ring-primary/15">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                  <td colSpan={6} className="px-4 py-8">
                    <EmptyState
                      icon={Users}
                      className="border-0 bg-transparent py-8 shadow-none"
                      title="No records match your filters"
                      description="Try clearing search or status filters to see more people."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">{u.fullName}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">ID: {u.id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "rounded-full px-2 py-0.5 text-xs font-semibold ring-1",
                          personStatusBadgeClass(u),
                        )}
                      >
                        {personStatusLabel(u)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="tabular-nums text-[var(--foreground)]">{u.primaryMetricValue}</p>
                      {u.secondaryMetricLabel && typeof u.secondaryMetricValue === "number" ? (
                        <p className="text-xs text-muted-foreground">
                          {u.secondaryMetricLabel}: {u.secondaryMetricValue}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(u.createdAtIso).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => openMenu(u.id, e.currentTarget)}
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition",
                          panel?.userId === u.id
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

      {popover}
    </div>
  );
}
