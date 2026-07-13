import { CalendarDays } from "lucide-react";
import { MentorWeeklySchedule } from "@/components/student/mentor-weekly-schedule";
import type { InstructorAvailabilitySlot } from "@/lib/student/load-instructor-profile";

type InstructorAvailabilitySectionProps = {
  availability: InstructorAvailabilitySlot[];
  timezoneLabel: string;
};

export function InstructorAvailabilitySection({
  availability,
  timezoneLabel,
}: InstructorAvailabilitySectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays
            className="h-5 w-5 text-[var(--primary)]"
            strokeWidth={1.75}
          />
          <h2 className="font-display text-lg font-bold text-[var(--ink-deep)]">
            Weekly availability
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">{timezoneLabel}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Recurring hours when sessions can be booked. Use &quot;Book now&quot; to
        pick a specific slot.
      </p>
      <div className="mt-5">
        {availability.length > 0 ? (
          <MentorWeeklySchedule availability={availability} />
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40 py-10 text-center text-sm text-muted-foreground">
            No weekly hours published yet. Check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
