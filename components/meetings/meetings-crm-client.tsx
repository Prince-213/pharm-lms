"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { MeetingDetailDrawer } from "@/components/meetings/meeting-detail-drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CalendarEvent } from "@/lib/meetings/calendar-events";
import {
  dateKeyFromDate,
  isWeekdayAvailable,
} from "@/lib/meetings/calendar-events";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad2(n: number) {
  return `${n}`.padStart(2, "0");
}

function parseDateKey(key: string): Date {
  const [y, mo, da] = key.split("-").map((x) => Number.parseInt(x, 10));
  return new Date(y, mo - 1, da, 12, 0, 0, 0);
}

function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${pad2(month + 1)}-${pad2(d)}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

type MeetingsCrmClientProps = {
  events: CalendarEvent[];
  role: "student" | "host";
  /** Host-only: weekdays (0=Mon) with recurring availability */
  availableWeekdays?: number[];
};

export function MeetingsCrmClient({
  events,
  role,
  availableWeekdays = [],
}: MeetingsCrmClientProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dayList, setDayList] = useState<CalendarEvent[]>([]);
  const [dayListOpen, setDayListOpen] = useState(false);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.dateKey) ?? [];
      list.push(ev);
      map.set(ev.dateKey, list);
    }
    return map;
  }, [events]);

  const matrix = useMemo(
    () => monthMatrix(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" },
  );

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function openDayList(events: CalendarEvent[]) {
    setDayList(events);
    setDayListOpen(true);
  }

  function openEvent(ev: CalendarEvent) {
    setSelected(ev);
    setDrawerOpen(true);
  }

  const isHost = role === "host";
  const showAvailabilityGray = isHost && availableWeekdays.length > 0;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
              }}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)]/30"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface-muted)]/40">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="divide-y divide-[var(--border)]">
          {matrix.map((week, wi) => (
            <div key={`week-${wi}`} className="grid grid-cols-7">
              {week.map((dateKey, di) => {
                if (!dateKey) {
                  return (
                    <div
                      key={`empty-${wi}-${di}`}
                      className="min-h-[88px] border-r border-[var(--border)] bg-[var(--surface-muted)]/20 last:border-r-0"
                    />
                  );
                }

                const dayEvents = eventsByDay.get(dateKey) ?? [];
                const dayDate = parseDateKey(dateKey);
                const isToday = dateKey === dateKeyFromDate(today);
                const weekdayOk =
                  !showAvailabilityGray ||
                  isWeekdayAvailable(dayDate, availableWeekdays);
                const isEmpty = dayEvents.length === 0;
                const muted = isEmpty && (!showAvailabilityGray || !weekdayOk);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => {
                      if (dayEvents.length === 1) openEvent(dayEvents[0]);
                      else if (dayEvents.length > 1) openDayList(dayEvents);
                    }}
                    className={cn(
                      "flex min-h-[88px] flex-col border-r border-[var(--border)] p-1.5 text-left last:border-r-0 sm:p-2",
                      muted
                        ? "bg-[var(--surface-muted)]/50 opacity-60"
                        : "bg-[var(--surface)] hover:bg-[#f7f9fa]",
                      isToday && "ring-1 ring-inset ring-[var(--primary)]/30",
                      dayEvents.length > 0 && "cursor-pointer",
                    )}
                  >
                    <span
                      className={cn(
                        "mb-1 text-[11px] font-semibold tabular-nums",
                        isToday
                          ? "text-[var(--primary)]"
                          : "text-muted-foreground",
                      )}
                    >
                      {dayDate.getDate()}
                    </span>
                    <div className="flex flex-1 flex-col gap-1">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => openEvent(ev)}
                          className={cn(
                            "w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-semibold transition-opacity hover:opacity-90",
                            ev.kind === "pending_request" &&
                              "bg-amber-100 text-amber-800",
                            ev.kind === "scheduled" &&
                              "bg-[var(--primary-soft)]/60 text-[var(--primary-strong)]",
                            ev.kind === "active" &&
                              "bg-primary/15 text-primary",
                            ev.kind === "completed" &&
                              "bg-slate-100 text-slate-600",
                            (ev.kind === "rejected" || ev.kind === "cancelled") &&
                              "bg-rose-50 text-rose-700",
                          )}
                        >
                          {ev.shortLabel} · {ev.label}
                        </button>
                      ))}
                      {dayEvents.length > 3 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDayList(dayEvents);
                          }}
                          className="text-[10px] font-medium text-[var(--primary)]"
                        >
                          +{dayEvents.length - 3} more
                        </button>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {showAvailabilityGray ? (
          <p className="border-t border-[var(--border)] px-4 py-2 text-[11px] text-muted-foreground">
            Gray days are outside your published weekly availability.
          </p>
        ) : null}
      </div>

      <MeetingDetailDrawer
        event={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        role={role}
      />

      <Sheet open={dayListOpen} onOpenChange={setDayListOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Meetings this day</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 space-y-2">
            {dayList.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => {
                    setDayListOpen(false);
                    openEvent(ev);
                  }}
                  className="w-full rounded-lg border border-[#d1d7dc] bg-white px-3 py-2 text-left text-sm hover:bg-[#f7f9fa]"
                >
                  <span className="font-semibold">{ev.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {ev.displayStatus}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
