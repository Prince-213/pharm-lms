import { Clock } from "lucide-react";
import { MENTOR_DAY_LABELS } from "@/lib/meetings/mentor-availability-helpers";
import { cn } from "@/lib/utils";

export type MentorAvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

function formatTimeRange(start: string, end: string) {
  const fmt = (hm: string) => {
    const [h, m] = hm.split(":").map((x) => Number.parseInt(x, 10));
    const d = new Date(2000, 0, 1, h || 0, Number.isFinite(m) ? m : 0);
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

type MentorWeeklyScheduleProps = {
  availability: MentorAvailabilitySlot[];
};

export function MentorWeeklySchedule({
  availability,
}: MentorWeeklyScheduleProps) {
  const byDay = new Map(
    availability.map((a) => [a.dayOfWeek, a] as const),
  );

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {MENTOR_DAY_LABELS.map((label, dayIndex) => {
        const slot = byDay.get(dayIndex);
        const active = Boolean(slot);

        return (
          <div
            key={label}
            className={cn(
              "rounded-[var(--radius-lg)] border px-3 py-3 text-center transition-colors",
              active
                ? "border-[var(--primary)]/30 bg-[var(--primary-soft)]/25"
                : "border-[var(--border)] bg-[var(--surface-muted)]/30 opacity-60",
            )}
          >
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                active ? "text-[var(--primary-strong)]" : "text-[var(--muted)]",
              )}
            >
              {label}
            </p>
            {slot ? (
              <p className="mt-2 flex items-center justify-center gap-1 text-[11px] font-medium leading-tight text-[var(--foreground)]">
                <Clock className="h-3 w-3 shrink-0 text-[var(--muted)]" />
                <span>{formatTimeRange(slot.startTime, slot.endTime)}</span>
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-[var(--muted)]">Unavailable</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
