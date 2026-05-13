"use client";

import { Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminBroadcastNotificationAction } from "@/app/admin/messages/actions";

const audiences = [
  { value: "STUDENTS" as const, label: "All students" },
  { value: "INSTRUCTORS" as const, label: "Tutors & mentors" },
  { value: "ALL_LEARNERS" as const, label: "Students + tutors + mentors" },
];

export function AdminBroadcastForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);
    const audience = fd.get("audience") as
      | "STUDENTS"
      | "INSTRUCTORS"
      | "ALL_LEARNERS";
    const title = String(fd.get("title") ?? "");
    const body = String(fd.get("body") ?? "");
    const href = String(fd.get("href") ?? "").trim();

    startTransition(async () => {
      const res = await adminBroadcastNotificationAction({
        audience,
        title,
        body,
        href: href.length ? href : null,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setSuccess(`Sent to ${res.recipientCount} recipient(s).`);
      e.currentTarget.reset();
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--primary-soft)]/40 p-2 text-[var(--primary-strong)]">
          <Megaphone className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)]">
            Broadcast notification
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            Delivers an in-app notification (bell icon) to each person in the
            audience. Admin accounts are not targeted. Use for outages, policy
            updates, or platform-wide reminders.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="broadcast-audience"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            Audience
          </label>
          <select
            id="broadcast-audience"
            name="audience"
            required
            className="h-11 w-full max-w-md rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
          >
            {audiences.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="broadcast-title"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            Title
          </label>
          <input
            id="broadcast-title"
            name="title"
            required
            maxLength={180}
            placeholder="e.g. Scheduled maintenance tonight"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </div>
        <div>
          <label
            htmlFor="broadcast-body"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            Message
          </label>
          <textarea
            id="broadcast-body"
            name="body"
            required
            rows={5}
            maxLength={2000}
            placeholder="Short details students and staff should know."
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </div>
        <div>
          <label
            htmlFor="broadcast-href"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            Link (optional)
          </label>
          <input
            id="broadcast-href"
            name="href"
            maxLength={500}
            placeholder="/student/browse or https://…"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </div>
        {error ? (
          <p className="text-sm text-rose-600" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm font-medium text-[var(--success)]">{success}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--primary)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send broadcast"}
        </button>
      </form>
    </div>
  );
}
