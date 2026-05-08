"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createBadgeAction } from "@/app/admin/badges/actions";
import { BADGE_RULE_DEFINITIONS } from "@/lib/badges/rule-definitions";

const RULE_OPTIONS = BADGE_RULE_DEFINITIONS;

export function NewBadgeDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ruleType, setRuleType] = useState<string>(RULE_OPTIONS[0].value);
  const [threshold, setThreshold] = useState<number>(
    RULE_OPTIONS[0].defaultThreshold,
  );

  const ruleOption =
    RULE_OPTIONS.find((r) => r.value === ruleType) ?? RULE_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function reset() {
    setName("");
    setDescription("");
    setRuleType(RULE_OPTIONS[0].value);
    setThreshold(RULE_OPTIONS[0].defaultThreshold);
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createBadgeAction({
        name: name.trim(),
        description: description.trim(),
        ruleType,
        threshold,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
      >
        <Plus className="h-4 w-4" />
        New badge
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-transparent"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-badge-title"
            className="relative w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h2
                id="new-badge-title"
                className="text-base font-bold text-[var(--foreground)]"
              >
                Create badge
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
              <label className="block text-sm">
                <span className="font-semibold text-[var(--foreground)]">
                  Name
                </span>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                  placeholder="e.g. First Steps"
                />
              </label>

              <label className="block text-sm">
                <span className="font-semibold text-[var(--foreground)]">
                  Description
                </span>
                <textarea
                  required
                  minLength={4}
                  maxLength={280}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[80px] w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                  placeholder="Earned by enrolling in your first course."
                />
              </label>

              <p className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--muted)]">
                {ruleOption.description}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-semibold text-[var(--foreground)]">
                    Rule
                  </span>
                  <select
                    value={ruleType}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRuleType(v);
                      const opt = RULE_OPTIONS.find((r) => r.value === v);
                      if (opt) setThreshold(opt.defaultThreshold);
                    }}
                    className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                  >
                    {RULE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-semibold text-[var(--foreground)]">
                    {ruleOption.thresholdLabel}
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10000}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value) || 1)}
                    className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                  />
                </label>
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <footer className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
                >
                  {pending ? "Creating…" : "Create badge"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
