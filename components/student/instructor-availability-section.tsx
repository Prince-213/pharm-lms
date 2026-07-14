import { CalendarDays } from "lucide-react";
import { MentorWeeklySchedule } from "@/components/student/mentor-weekly-schedule";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" strokeWidth={1.75} />
            <CardTitle className="font-display text-lg">Weekly availability</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">{timezoneLabel}</p>
        </div>
        <CardDescription>
          Recurring hours when sessions can be booked. Use &quot;Book now&quot; to pick a
          specific slot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availability.length > 0 ? (
          <MentorWeeklySchedule availability={availability} />
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/40 py-10 text-center text-sm text-muted-foreground">
            No weekly hours published yet. Check back soon.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
