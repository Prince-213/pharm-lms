"use client";

import { CalendarDays, Clock, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

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

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/meetings/availability", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        setLoaded(true);
        return;
      }
      const data = (await res.json()) as {
        slots: {
          dayOfWeek: number;
          startTime: string;
          endTime: string;
          timezone: string;
        }[];
      };
      if (!data.slots.length) {
        setLoaded(true);
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
      for (const slot of data.slots) {
        const key = WEEKDAYS[slot.dayOfWeek]?.key;
        if (key) dayMap[key] = true;
      }
      setDayEnabled(dayMap);
      setStartTime(data.slots[0].startTime);
      setEndTime(data.slots[0].endTime);
      setScheduleConfigured(true);
      setSavedHint(`Availability synced (${data.slots[0].timezone}).`);
      setLoaded(true);
    })();
  }, []);

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
      setScheduleConfigured(true);
      setSavedHint("Weekly hours saved and visible to students.");
      closeModal();
    })();
  }

  return (
    <>
      <section className="mb-10 overflow-hidden rounded border border-[#d1d7dc] bg-gradient-to-b from-[#fafbff] to-white">
        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div className="flex gap-5">
            <div className="hidden h-28 w-36 shrink-0 rounded-lg border border-dashed border-[#c0c4cc] bg-white sm:flex sm:items-center sm:justify-center">
              <CalendarDays
                className="h-12 w-12 text-[#d1d7dc]"
                strokeWidth={1.25}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1c1d1f]">
                Set your availability
              </h3>
              {!loaded ? (
                <p className="mt-2 text-sm leading-relaxed text-[#6a6f73]">
                  Loading current schedule...
                </p>
              ) : scheduleConfigured ? (
                <p className="mt-2 text-sm leading-relaxed text-[#6a6f73]">
                  You have a weekly hours template saved. Students will only see
                  slots that match these windows once booking is enabled. You
                  can{" "}
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
                <p className="mt-2 text-sm leading-relaxed text-[#6a6f73]">
                  The first time you use meetings, choose the days and times you
                  are open for one-on-one sessions. Until you save a schedule,
                  students will see you as{" "}
                  <span className="font-semibold text-[#1c1d1f]">
                    available every day, any time
                  </span>{" "}
                  (placeholder for the default policy in the real product).
                </p>
              )}
              {savedHint ? (
                <p className="mt-3 rounded border border-[#c5e5cf] bg-[#e8f9ef] px-3 py-2 text-xs text-[#1e4620]">
                  {savedHint}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSaveError(null);
                  setModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
              >
                <Clock className="h-4 w-4" />
                Configure weekly hours
              </button>
            </div>
          </div>
          <div className="rounded border border-[#e8edf2] bg-[#f7f9fa] p-4 text-xs text-[#6a6f73] sm:max-w-[220px]">
            <p className="font-semibold text-[#1c1d1f]">Tip</p>
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
            className="absolute inset-0 bg-[#1c1d1f]/50"
            aria-label="Close dialog"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col rounded-lg border border-[#d1d7dc] bg-white shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-[#ececec] px-5 py-4">
              <div>
                <h2 id={titleId} className="text-lg font-bold text-[#1c1d1f]">
                  Weekly hours
                </h2>
                <p className="mt-1 text-xs text-[#6a6f73]">
                  Turn days on or off, then set the window that repeats each
                  week.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded p-1 text-[#6a6f73] hover:bg-[#f7f7f8] hover:text-[#1c1d1f]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-5 py-4">
              {saveError ? (
                <p className="rounded border border-[#f3d0c7] bg-[#fff4e5] px-3 py-2 text-xs text-[#8a4a1b]">
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
                    className="h-10 w-full rounded border border-[#d1d7dc] px-2 text-sm"
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
                    className="h-10 w-full rounded border border-[#d1d7dc] px-2 text-sm"
                  />
                </div>
              </div>

              <ul className="divide-y divide-[#ececec] rounded border border-[#d1d7dc]">
                {WEEKDAYS.map((d) => (
                  <li
                    key={d.key}
                    className="flex items-center justify-between gap-3 bg-[#fcfcfd] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-[#1c1d1f]">
                      {d.label}
                    </span>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6a6f73]">
                      <input
                        type="checkbox"
                        checked={dayEnabled[d.key]}
                        onChange={() => toggleDay(d.key)}
                        className="h-4 w-4 rounded border-[#d1d7dc] text-[var(--primary)]"
                      />
                      Available
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#ececec] px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-sm border border-[#d1d7dc] bg-white px-4 py-2 text-sm font-semibold text-[#3e4143]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-sm bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
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
