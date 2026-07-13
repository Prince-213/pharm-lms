"use client";

import { Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createCouponAction } from "@/app/admin/coupons/actions";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";

export type CouponCourseOption = {
  id: string;
  title: string;
  priceMinorUnits: number | null;
  priceCurrency: string;
  mentorName: string;
};

function randomSuffix(len: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function NewCouponDialog({
  courses,
}: {
  courses: CouponCourseOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState(() => `SAVE${randomSuffix(6)}`);
  const [percentOff, setPercentOff] = useState<number>(25);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [maxRedemptions, setMaxRedemptions] = useState<string>("");
  const [perStudent, setPerStudent] = useState<number>(1);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function reset() {
    setCode(`SAVE${randomSuffix(6)}`);
    setPercentOff(25);
    setSelectedIds(new Set());
    setSearch("");
    setExpiresAt("");
    setMaxRedemptions("");
    setPerStudent(1);
    setError(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.mentorName.toLowerCase().includes(q),
    );
  }, [courses, search]);

  function toggleCourse(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedCode = code.trim().toUpperCase();
    if (selectedIds.size === 0) {
      setError("Pick at least one course this coupon applies to.");
      return;
    }

    const maxRed = maxRedemptions.trim() ? Number(maxRedemptions.trim()) : null;
    if (maxRed != null && (!Number.isInteger(maxRed) || maxRed < 1)) {
      setError("Total redemptions must be a positive whole number.");
      return;
    }

    startTransition(async () => {
      const result = await createCouponAction({
        code: normalizedCode,
        percentOff,
        courseIds: Array.from(selectedIds),
        expiresAt: expiresAt ? expiresAt : null,
        maxRedemptions: maxRed,
        maxRedemptionsPerStudent: perStudent,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast.success(`Coupon ${normalizedCode} created.`);
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  if (courses.length === 0) {
    return (
      <button
        type="button"
        disabled
        title="At least one published, paid course is required to create a coupon."
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-muted-foreground"
      >
        <Plus className="h-4 w-4" />
        New coupon
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
      >
        <Plus className="h-4 w-4" />
        New coupon
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-transparent"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-coupon-title"
            className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <h2
                id="new-coupon-title"
                className="text-base font-bold text-[var(--foreground)]"
              >
                Create coupon
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <form
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              <div className="space-y-4 px-5 py-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                  <label className="block text-sm">
                    <span className="font-semibold text-[var(--foreground)]">
                      Coupon code
                    </span>
                    <input
                      type="text"
                      required
                      minLength={4}
                      maxLength={40}
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.toUpperCase().slice(0, 40))
                      }
                      className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 font-mono text-sm uppercase tracking-wide outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                      placeholder="SAVE25"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Letters, numbers, dashes, and underscores.
                    </span>
                  </label>
                  <label className="block text-sm">
                    <span className="font-semibold text-[var(--foreground)]">
                      Discount (%)
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={99}
                      value={percentOff}
                      onChange={(e) =>
                        setPercentOff(
                          Math.max(
                            1,
                            Math.min(99, Number(e.target.value) || 1),
                          ),
                        )
                      }
                      className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                    />
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      Courses ({selectedIds.size} selected)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedIds(new Set())}
                      className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search courses by title or mentor"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                    />
                  </div>
                  <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
                    {filtered.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                        No courses match your search.
                      </p>
                    ) : (
                      <ul>
                        {filtered.map((c) => {
                          const checked = selectedIds.has(c.id);
                          return (
                            <li
                              key={c.id}
                              className="border-b border-[var(--border)] last:border-b-0"
                            >
                              <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--surface-muted)]">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleCourse(c.id)}
                                  className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-medium text-[var(--foreground)]">
                                    {c.title}
                                  </span>
                                  <span className="block text-xs text-muted-foreground">
                                    {c.mentorName}
                                  </span>
                                </span>
                                <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                                  {formatMinorUnitsToCurrency(
                                    c.priceMinorUnits,
                                    c.priceCurrency,
                                  )}
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-sm">
                    <span className="font-semibold text-[var(--foreground)]">
                      Expires
                    </span>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Leave blank for no expiry.
                    </span>
                  </label>
                  <label className="block text-sm">
                    <span className="font-semibold text-[var(--foreground)]">
                      Total redemptions
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={maxRedemptions}
                      onChange={(e) => setMaxRedemptions(e.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                      placeholder="Unlimited"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Optional cap.
                    </span>
                  </label>
                  <label className="block text-sm">
                    <span className="font-semibold text-[var(--foreground)]">
                      Per student
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={perStudent}
                      onChange={(e) =>
                        setPerStudent(
                          Math.max(
                            1,
                            Math.min(100, Number(e.target.value) || 1),
                          ),
                        )
                      }
                      className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm tabular-nums outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
                    />
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Default 1.
                    </span>
                  </label>
                </div>

                {error ? (
                  <p className="text-sm text-rose-600">{error}</p>
                ) : null}
              </div>

              <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
                >
                  {pending ? "Creating…" : "Create coupon"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
