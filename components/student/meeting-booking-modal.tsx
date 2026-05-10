"use client";

import { Calendar, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MENTOR_DAY_LABELS,
  mondayZeroFromDate,
} from "@/lib/meetings/mentor-availability-helpers";

export type MeetingAvailabilityRow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

function pad2(n: number) {
  return `${n}`.padStart(2, "0");
}

function dateKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseDateKey(key: string): Date {
  const [y, mo, da] = key.split("-").map((x) => Number.parseInt(x, 10));
  return new Date(y, mo - 1, da, 0, 0, 0, 0);
}

function minutesFromMidnight(hm: string): number {
  const [h, m] = hm.split(":").map((x) => Number.parseInt(x, 10));
  return (h || 0) * 60 + (Number.isFinite(m) ? m : 0);
}

function generateHalfHourSlots(startHm: string, endHm: string): string[] {
  let cur = minutesFromMidnight(startHm);
  const end = minutesFromMidnight(endHm);
  const out: string[] = [];
  while (cur < end) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    out.push(`${pad2(h)}:${pad2(m)}`);
    cur += 30;
  }
  return out;
}

function formatSlotLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map((x) => Number.parseInt(x, 10));
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function slotsForDateKey(
  dateKey: string,
  availability: MeetingAvailabilityRow[],
  now: Date,
): string[] {
  const day = parseDateKey(dateKey);
  const dow = mondayZeroFromDate(day);
  const row = availability.find((a) => a.dayOfWeek === dow);
  if (!row) return [];
  const slots = generateHalfHourSlots(row.startTime, row.endTime);
  const isSameCalendarDay =
    now.getFullYear() === day.getFullYear() &&
    now.getMonth() === day.getMonth() &&
    now.getDate() === day.getDate();
  if (!isSameCalendarDay) return slots;
  return slots.filter((hm) => {
    const [hh, mm] = hm.split(":").map((x) => Number.parseInt(x, 10));
    const t = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      hh,
      mm,
      0,
      0,
    );
    return t.getTime() > now.getTime();
  });
}

function preferredIsoLocal(dateKey: string, hhmm: string): string {
  const day = parseDateKey(dateKey);
  const [hh, mm] = hhmm.split(":").map((x) => Number.parseInt(x, 10));
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hh,
    mm,
    0,
    0,
  ).toISOString();
}

function validateSlot(
  dateKey: string,
  hhmm: string,
  availability: MeetingAvailabilityRow[],
): string | null {
  const day = parseDateKey(dateKey);
  const dow = mondayZeroFromDate(day);
  const dayLabel = MENTOR_DAY_LABELS[dow];
  const allowedLabels = availability.map((a) => MENTOR_DAY_LABELS[a.dayOfWeek]);
  if (!allowedLabels.includes(dayLabel)) {
    return `Choose one of: ${allowedLabels.join(", ")}.`;
  }
  const row = availability.find((a) => a.dayOfWeek === dow);
  if (!row) return "That day is not available.";
  const mSlot = minutesFromMidnight(hhmm);
  const mStart = minutesFromMidnight(row.startTime);
  const mEnd = minutesFromMidnight(row.endTime);
  if (mSlot < mStart || mSlot >= mEnd) {
    return `Pick a time between ${row.startTime} and ${row.endTime}.`;
  }
  return null;
}

export function MeetingBookingModal({
  courseId,
  mentorId,
  mentorName,
  availability,
  primaryCta = "Book 1-on-1 session",
}: {
  courseId?: string;
  mentorId: string;
  mentorName: string;
  availability: MeetingAvailabilityRow[];
  /** Button label (e.g. shorter copy for coach directory). */
  primaryCta?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const dateOptions = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const out: {
      key: string;
      labelDow: string;
      labelNum: string;
      disabled: boolean;
    }[] = [];
    for (let i = 0; i < 21; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const dow = mondayZeroFromDate(d);
      const enabled = availability.some((a) => a.dayOfWeek === dow);
      const key = dateKeyFromDate(d);
      out.push({
        key,
        labelDow: MENTOR_DAY_LABELS[dow],
        labelNum: `${d.getDate()}`,
        disabled: !enabled,
      });
    }
    return out;
  }, [availability]);

  const pickFirstSelectable = useCallback(() => {
    const live = new Date();
    for (const opt of dateOptions) {
      if (opt.disabled) continue;
      if (slotsForDateKey(opt.key, availability, live).length > 0) {
        return opt.key;
      }
    }
    return null;
  }, [availability, dateOptions]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(null);
    const first = pickFirstSelectable();
    setSelectedDateKey(first);
    setSelectedSlot(null);
  }, [open, pickFirstSelectable]);

  const slotList = useMemo(() => {
    if (!selectedDateKey) return [];
    return slotsForDateKey(selectedDateKey, availability, new Date());
  }, [selectedDateKey, availability]);

  useEffect(() => {
    if (!selectedDateKey || !selectedSlot) return;
    if (!slotList.includes(selectedSlot)) setSelectedSlot(null);
  }, [selectedDateKey, selectedSlot, slotList]);

  async function submitScheduled() {
    setError(null);
    if (!selectedDateKey || !selectedSlot) {
      setError("Select a date and time to continue.");
      return;
    }
    const v = validateSlot(selectedDateKey, selectedSlot, availability);
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/meetings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseId || undefined,
          mentorId,
          instant: false,
          preferredTime: preferredIsoLocal(selectedDateKey, selectedSlot),
          message: message.trim() || undefined,
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(
          typeof body?.error === "string"
            ? body.error
            : "Could not book this slot.",
        );
        return;
      }
      setSuccess(
        `Success! Your consultation with ${mentorName} is booked and confirmed.`,
      );
      setOpen(false);
      window.setTimeout(() => {
        router.push("/student/meetings");
      }, 2200);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitInstant() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/meetings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseId || undefined,
          mentorId,
          instant: true,
          message: message.trim() || undefined,
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
        meeting?: { id: string; joinUrl: string };
      } | null;
      if (!res.ok) {
        setError(
          typeof body?.error === "string"
            ? body.error
            : "Could not start instant session.",
        );
        return;
      }
      setOpen(false);
      setSuccess("Connecting you to the live room…");
      const meetingId = body?.meeting?.id;
      if (meetingId) {
        window.setTimeout(() => {
          window.location.href = `/student/meetings/join/${meetingId}`;
        }, 800);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--primary)] py-3.5 text-sm font-bold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--primary-strong)]"
      >
        <Calendar className="h-4 w-4 shrink-0" strokeWidth={2} />
        {primaryCta}
      </button>

      {success ? (
        <div className="fixed top-5 left-1/2 z-[100] flex max-w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--primary-soft)] bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--primary-soft-text)] shadow-[var(--shadow-md)]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
          {success}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
          <div className="flex max-h-[min(92vh,640px)] w-full max-w-lg flex-col rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] sm:rounded-2xl">
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <h3 className="font-display text-lg font-bold text-[var(--foreground)]">
                Select time slot
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-[var(--muted-soft)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <p className="text-xs text-[var(--muted)]">
                Choose a day your mentor is available, then pick a start time
                (local time).
              </p>

              <div className="mt-4 -mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-min gap-2 px-1">
                  {dateOptions.map((opt) => {
                    const active = opt.key === selectedDateKey;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => {
                          if (opt.disabled) return;
                          setSelectedDateKey(opt.key);
                          setSelectedSlot(null);
                        }}
                        className={`flex min-w-[3.25rem] shrink-0 flex-col items-center rounded-[var(--radius-md)] px-2.5 py-2 text-[11px] font-bold transition ${
                          opt.disabled
                            ? "cursor-not-allowed opacity-35"
                            : active
                              ? "border-2 border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-soft-text)]"
                              : "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)] hover:border-[var(--primary)]/40"
                        }`}
                      >
                        <span className="uppercase tracking-wide">
                          {opt.labelDow}
                        </span>
                        <span className="mt-0.5 text-sm tabular-nums">
                          {opt.labelNum}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slotList.length ? (
                  slotList.map((hm) => {
                    const active = hm === selectedSlot;
                    return (
                      <button
                        key={hm}
                        type="button"
                        onClick={() => setSelectedSlot(hm)}
                        className={`rounded-[var(--radius-md)] py-2.5 text-center text-xs font-semibold transition ${
                          active
                            ? "border-2 border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-soft-text)]"
                            : "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)] hover:border-[var(--primary)]/35"
                        }`}
                      >
                        {formatSlotLabel(hm)}
                      </button>
                    );
                  })
                ) : (
                  <p className="col-span-full py-6 text-center text-sm text-[var(--muted)]">
                    No open times on this day. Pick another date.
                  </p>
                )}
              </div>

              <label className="mt-5 block text-xs font-semibold text-[var(--foreground)]">
                Note for your mentor (optional)
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="Topics you’d like to cover, case context, etc."
                />
              </label>

              {error ? (
                <p className="mt-3 text-xs font-medium text-rose-700">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => void submitInstant()}
                disabled={submitting}
                className="mt-4 w-full text-center text-xs font-bold text-[var(--primary)] underline-offset-2 hover:underline disabled:opacity-50"
              >
                Need an immediate session instead?
              </button>
            </div>

            <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 px-5 py-4">
              <button
                type="button"
                onClick={() => void submitScheduled()}
                disabled={submitting || !selectedDateKey || !selectedSlot}
                className="flex w-full items-center justify-center rounded-[var(--radius-lg)] bg-[var(--primary)] py-3.5 text-sm font-bold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--primary-strong)] disabled:opacity-50"
              >
                {submitting ? "Confirming…" : "Confirm selected slot"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
