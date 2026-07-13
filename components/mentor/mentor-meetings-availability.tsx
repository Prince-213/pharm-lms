"use client";

import { clsx } from "clsx";
import { CalendarDays, Clock, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

const WEEKDAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

const defaultEnabled = Object.fromEntries(
  WEEKDAYS.map((d) => [d.key, d.key !== "sat" && d.key !== "sun"]),
) as Record<(typeof WEEKDAYS)[number]["key"], boolean>;

export function MentorMeetingsAvailabilityCallout() {
  const titleId = useId();
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleConfigured, setScheduleConfigured] = useState(false);
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const [dayEnabled, setDayEnabled] = useState(defaultEnabled);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [savedSlots, setSavedSlots] = useState<AvailabilitySlot[]>([]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSaveError(null);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  function toggleDay(key: (typeof WEEKDAYS)[number]["key"]) {
    setDayEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const applySlotsToState = useCallback((slots: AvailabilitySlot[]) => {
    if (!slots.length) {
      setScheduleConfigured(false);
      setSavedSlots([]);
      return;
    }
    const dayMap = {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    };
    for (const slot of slots) {
      const key = WEEKDAYS[slot.dayOfWeek]?.key;
      if (key) dayMap[key] = true;
    }
    setDayEnabled(dayMap);
    setStartTime(slots[0].startTime);
    setEndTime(slots[0].endTime);
    setScheduleConfigured(true);
    setSavedSlots(slots);
    setSavedHint(`Availability synced (${slots[0].timezone}).`);
  }, []);

  const refreshAvailability = useCallback(async () => {
    const res = await fetch("/api/meetings/availability", {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as { slots: AvailabilitySlot[] };
    if (!data.slots.length) {
      setScheduleConfigured(false);
      setSavedSlots([]);
      return;
    }
    applySlotsToState(data.slots);
  }, [applySlotsToState]);

  useEffect(() => {
    void (async () => {
      await refreshAvailability();
      setLoaded(true);
    })();
  }, [refreshAvailability]);

  function handleSave() {
    setSaveError(null);
    const anyDay = WEEKDAYS.some((d) => dayEnabled[d.key]);
    if (!anyDay) {
      setSaveError("Turn on at least one day.");
      return;
    }
    if (startTime >= endTime) {
      setSaveError("End time must be after start time.");
      return;
    }
    void (async () => {
      setSaving(true);
      const dayIndexes = WEEKDAYS.flatMap((d, index) =>
        dayEnabled[d.key] ? [index] : [],
      );
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
      const res = await fetch("/api/meetings/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone,
          startTime,
          endTime,
          days: dayIndexes,
        }),
      });
      setSaving(false);
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setSaveError(body?.error ?? "Could not save availability.");
        return;
      }
      await refreshAvailability();
      setSavedHint("Weekly hours saved and visible to students.");
      closeModal();
    })();
  }

  const summaryTimezone = savedSlots[0]?.timezone;
  const summaryWindow =
    savedSlots.length > 0
      ? `${savedSlots[0].startTime} – ${savedSlots[0].endTime}`
      : null;

  return (
    <>
      <section className="mb-10 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div className="flex gap-5">
            <div className="hidden h-28 w-36 shrink-0 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--background)] sm:flex sm:items-center sm:justify-center">
              <CalendarDays
                className="h-12 w-12 text-muted-foreground"
                strokeWidth={1.25}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                Set your availability
              </h3>
              {!loaded ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Loading current schedule...
                </p>
              ) : scheduleConfigured ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Your weekly template is saved. Students only see bookable slots
                  inside these windows. You can{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setSaveError(null);
                      setModalOpen(true);
                    }}
                    className="font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
                  >
                    edit your hours
                  </button>{" "}
                  anytime.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Choose the days and times you are open for one-on-one sessions.
                  Until you save a schedule, the booking UI may assume flexible
                  availability.
                </p>
              )}
              {scheduleConfigured && loaded && summaryWindow && summaryTimezone ? (
                <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--primary)]/25 bg-[var(--primary-soft)]/30 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Active schedule
                  </p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-[var(--foreground)]">
                    {summaryWindow}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {summaryTimezone}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {WEEKDAYS.map((d) => (
                      <span
                        key={d.key}
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-[11px] font-bold",
                          dayEnabled[d.key]
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-[var(--surface-muted)] text-muted-foreground",
                        )}
                      >
                        {d.label.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {savedHint ? (
                <p className="mt-3 rounded-[var(--radius-md)] border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary dark:border-primary/30 dark:bg-primary/20 dark:text-primary-foreground/90">
                  {savedHint}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSaveError(null);
                  setModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-strong)]"
              >
                <Clock className="h-4 w-4" />
                {scheduleConfigured ? "Edit weekly hours" : "Configure weekly hours"}
              </button>
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4 text-xs text-muted-foreground sm:max-w-[220px]">
            <p className="font-semibold text-[var(--foreground)]">Tip</p>
            <p className="mt-2 leading-relaxed">
              Block lunch or teaching hours so requests only land when you can
              actually meet.
            </p>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close dialog"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2 id={titleId} className="text-lg font-bold text-[var(--foreground)]">
                  Weekly hours
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Turn days on or off, then set the window that repeats each
                  week.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded p-1 text-muted-foreground hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-5 py-4">
              {saveError ? (
                <p className="rounded-[var(--radius-md)] border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                  {saveError}
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="avail-start"
                    className="mb-1 block text-xs font-semibold"
                  >
                    Start
                  </label>
                  <input
                    id="avail-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="avail-end"
                    className="mb-1 block text-xs font-semibold"
                  >
                    End
                  </label>
                  <input
                    id="avail-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)]"
                  />
                </div>
              </div>

              <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-md)] border border-[var(--border)]">
                {WEEKDAYS.map((d) => (
                  <li
                    key={d.key}
                    className="flex items-center justify-between gap-3 bg-[var(--background)] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {d.label}
                    </span>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={dayEnabled[d.key]}
                        onChange={() => toggleDay(d.key)}
                        className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
                      />
                      Available
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-strong)] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save weekly hours"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
