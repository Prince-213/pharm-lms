"use client";

import Link from "next/link";
import { Video } from "lucide-react";
import { MeetingRequestActions } from "@/components/meetings/meeting-request-actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserRole } from "@/generated/prisma/enums";
import {
  formatCalendarEventTime,
  type CalendarEvent,
} from "@/lib/meetings/calendar-events";

type MeetingDetailDrawerProps = {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "student" | "host";
};

function hostRoleLabel(role: UserRole | null): string {
  if (role === UserRole.TUTOR) return "Tutor";
  if (role === UserRole.MENTOR) return "Mentor";
  return "Host";
}

export function MeetingDetailDrawer({
  event,
  open,
  onOpenChange,
  role,
}: MeetingDetailDrawerProps) {
  const isHost = role === "host";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-[var(--border)] sm:max-w-md"
      >
        {event ? (
          <>
            <SheetHeader>
              <SheetTitle className="text-left font-display text-lg">
                {event.label}
              </SheetTitle>
              <SheetDescription className="text-left">
                {event.courseTitle ?? (isHost ? "Meeting request" : "Session")}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-5 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                  Status
                </p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">
                  {event.displayStatus}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                  {isHost ? "Student" : "Host"}
                </p>
                <p className="mt-1 font-semibold">{event.counterpartyName}</p>
                {event.counterpartyEmail ? (
                  <p className="text-xs text-[var(--muted)]">
                    {event.counterpartyEmail}
                  </p>
                ) : null}
                {!isHost && event.counterpartyRole ? (
                  <span className="mt-2 inline-flex rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                    {hostRoleLabel(event.counterpartyRole)}
                  </span>
                ) : null}
                {event.enrolledCoursesLine ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {event.enrolledCoursesLine}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                    Submitted
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground)]">
                    {formatCalendarEventTime(event.submittedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                    Preferred
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground)]">
                    {formatCalendarEventTime(event.preferredTime)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                    Scheduled
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground)]">
                    {formatCalendarEventTime(event.scheduledAt)}
                  </p>
                </div>
              </div>

              {event.message?.trim() ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                    Message
                  </p>
                  <p className="mt-1 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/30 px-3 py-2 text-xs leading-relaxed text-[var(--foreground)]">
                    {event.message.trim()}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
                {event.canAcceptReject ? (
                  <MeetingRequestActions
                    meetingRequestId={event.meetingRequestId}
                    preferredTime={
                      event.preferredTime
                        ? new Date(event.preferredTime)
                        : null
                    }
                  />
                ) : null}

                {event.joinable && event.joinHref ? (
                  <Link
                    href={event.joinHref}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-strong)]"
                  >
                    <Video className="h-4 w-4" />
                    Join meeting
                  </Link>
                ) : null}

                {!isHost && event.counterpartyId ? (
                  <Link
                    href={
                      event.counterpartyRole === UserRole.MENTOR
                        ? `/student/mentors/${event.counterpartyId}`
                        : `/student/tutors/${event.counterpartyId}`
                    }
                    className="text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    View {hostRoleLabel(event.counterpartyRole).toLowerCase()}{" "}
                    profile
                  </Link>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">Select a meeting slot.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
