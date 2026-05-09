"use client";

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";

export type MentorCalendarMeeting = {
  id: string;
  startsAtIso: string;
  status: string;
  studentName: string;
  joinUrl: string;
};

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function MentorMeetingsCalendar({
  meetings,
}: {
  meetings: MentorCalendarMeeting[];
}) {
  const [cursorMonth, setCursorMonth] = useState(() => startOfMonth(new Date()));
  const [selectedKey, setSelectedKey] = useState(() => dateKey(new Date()));

  const byDay = useMemo(() => {
    const map = new Map<string, MentorCalendarMeeting[]>();
    for (const m of meetings) {
      const d = new Date(m.startsAtIso);
      const key = dateKey(d);
      const prev = map.get(key);
      if (prev) prev.push(m);
      else map.set(key, [m]);
    }
    for (const v of map.values()) {
      v.sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso));
    }
    return map;
  }, [meetings]);

  const monthLabel = cursorMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const gridDays = useMemo(() => {
    const first = startOfMonth(cursorMonth);
    const offset = (first.getDay() + 6) % 7; // monday=0
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [cursorMonth]);

  const selectedMeetings = byDay.get(selectedKey) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[var(--muted)]" />
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {monthLabel}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursorMonth((d) => addMonths(d, -1))}
            className="rounded-md border border-[var(--border)] bg-[var(--background)] p-2 hover:bg-[var(--surface-muted)]"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursorMonth((d) => addMonths(d, 1))}
            className="rounded-md border border-[var(--border)] bg-[var(--background)] p-2 hover:bg-[var(--surface-muted)]"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 lg:col-span-7">
          <div className="grid grid-cols-7 gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-2 py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {gridDays.map((d) => {
              const key = dateKey(d);
              const inMonth = d.getMonth() === cursorMonth.getMonth();
              const isSelected = key === selectedKey;
              const count = byDay.get(key)?.length ?? 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={clsx(
                    "relative h-14 rounded-lg border px-2 py-1 text-left text-xs transition",
                    inMonth
                      ? "border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-muted)]"
                      : "border-[var(--border)] bg-[var(--surface-muted)]/40 text-[var(--muted)] hover:bg-[var(--surface-muted)]/60",
                    isSelected && "ring-2 ring-[var(--primary)]/30",
                  )}
                >
                  <div className="font-semibold tabular-nums">
                    {d.getDate()}
                  </div>
                  {count > 0 ? (
                    <div className="absolute bottom-2 right-2 rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
                      {count}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Selected day
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
            {new Date(selectedKey).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>

          {selectedMeetings.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              No meetings booked on this date.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedMeetings.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {m.studentName}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {new Date(m.startsAtIso).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {m.status}
                      </p>
                    </div>
                    <a
                      href={m.joinUrl}
                      className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-[var(--primary-foreground)] hover:opacity-90"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

