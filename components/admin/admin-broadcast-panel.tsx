"use client";

import { Megaphone, Users } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  adminBroadcastAudienceAction,
  adminBroadcastRecipientPreviewAction,
} from "@/app/actions/chat";

type AudienceMode = "ALL" | "CUSTOM";

export function AdminBroadcastPanel() {
  const [mode, setMode] = useState<AudienceMode>("ALL");
  const [students, setStudents] = useState(true);
  const [tutors, setTutors] = useState(true);
  const [mentors, setMentors] = useState(true);
  const [body, setBody] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [countError, setCountError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [previewPending, startPreview] = useTransition();

  const rolesForCustom = (): ("STUDENT" | "TUTOR" | "MENTOR")[] => {
    const r: ("STUDENT" | "TUTOR" | "MENTOR")[] = [];
    if (students) r.push("STUDENT");
    if (tutors) r.push("TUTOR");
    if (mentors) r.push("MENTOR");
    return r;
  };

  const refreshPreview = useCallback(() => {
    setCountError(null);
    if (mode === "CUSTOM") {
      const roles = rolesForCustom();
      if (roles.length === 0) {
        setCount(null);
        setCountError("Select at least one sector.");
        return;
      }
      startPreview(async () => {
        const res = await adminBroadcastRecipientPreviewAction({ mode: "CUSTOM", roles });
        if (res.ok) setCount(res.count);
        else {
          setCount(null);
          setCountError(res.message);
        }
      });
    } else {
      startPreview(async () => {
        const res = await adminBroadcastRecipientPreviewAction({ mode: "ALL" });
        if (res.ok) setCount(res.count);
        else {
          setCount(null);
          setCountError(res.message);
        }
      });
    }
  }, [mode, students, tutors, mentors]);

  useEffect(() => {
    refreshPreview();
  }, [refreshPreview]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);
    setSubmitError(null);
    const trimmed = body.trim();
    if (!trimmed) {
      setSubmitError("Enter a message.");
      return;
    }
    startTransition(async () => {
      if (mode === "CUSTOM") {
        const roles = rolesForCustom();
        if (roles.length === 0) {
          setSubmitError("Select at least one sector.");
          return;
        }
        const res = await adminBroadcastAudienceAction({
          body: trimmed,
          mode: "CUSTOM",
          roles,
        });
        if (res.ok) {
          setBody("");
          setSubmitMessage(`Sent to ${res.recipients} recipient(s).`);
        } else setSubmitError(res.message);
      } else {
        const res = await adminBroadcastAudienceAction({
          body: trimmed,
          mode: "ALL",
        });
        if (res.ok) {
          setBody("");
          setSubmitMessage(`Sent to ${res.recipients} recipient(s).`);
        } else setSubmitError(res.message);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-1)]"
    >
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)]">
          <Megaphone className="h-5 w-5 text-[var(--primary)]" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-[var(--foreground)]">
            Broadcast announcement
          </h3>
          <p className="mt-0.5 text-sm text-[var(--muted-soft)]">
            Delivers the same in-app message to each person’s 1:1 thread with you.
            Admins are never included.
          </p>
        </div>
      </div>

      <fieldset className="mb-4 space-y-3">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Audience
        </legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="audience"
            checked={mode === "ALL"}
            onChange={() => setMode("ALL")}
            className="accent-[var(--primary)]"
          />
          <span className="font-medium text-[var(--foreground)]">
            Everyone (all students, tutors, and mentors)
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="audience"
            checked={mode === "CUSTOM"}
            onChange={() => setMode("CUSTOM")}
            className="accent-[var(--primary)]"
          />
          <span className="font-medium text-[var(--foreground)]">
            Selected sectors only
          </span>
        </label>
        {mode === "CUSTOM" ? (
          <div className="ml-6 flex flex-wrap gap-4 border-l-2 border-[var(--border)] pl-4 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={students}
                onChange={(e) => setStudents(e.target.checked)}
                className="accent-[var(--primary)]"
              />
              Students
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={tutors}
                onChange={(e) => setTutors(e.target.checked)}
                className="accent-[var(--primary)]"
              />
              Tutors
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mentors}
                onChange={(e) => setMentors(e.target.checked)}
                className="accent-[var(--primary)]"
              />
              Mentors
            </label>
          </div>
        ) : null}
      </fieldset>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-[var(--muted)]" />
        {previewPending ? (
          <span className="text-[var(--muted)]">Counting recipients…</span>
        ) : countError ? (
          <span className="text-rose-700">{countError}</span>
        ) : count !== null ? (
          <span className="font-semibold text-[var(--foreground)]">
            {count.toLocaleString()} recipient{count === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your announcement…"
        rows={4}
        maxLength={4000}
        disabled={pending}
        className="mb-3 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
      />
      <p className="mb-3 text-right text-[10px] text-[var(--muted)]">
        {body.length} / 4000
      </p>

      {submitMessage ? (
        <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-100">
          {submitMessage}
        </p>
      ) : null}
      {submitError ? (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900 ring-1 ring-rose-100">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || (count !== null && count === 0)}
        className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send broadcast"}
      </button>
    </form>
  );
}
