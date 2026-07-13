"use client";

import Link from "next/link";
import { Video } from "lucide-react";
import { MeetingRequestActions } from "@/components/meetings/meeting-request-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        className="w-full overflow-y-auto border-[#d1d7dc] px-5 sm:max-w-md sm:px-6"
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

            <div className="mt-6 space-y-4 text-sm">
              <Card className="border-[#d1d7dc] bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="font-semibold text-[var(--foreground)]">
                    {event.displayStatus}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#d1d7dc] bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    {isHost ? "Student" : "Host"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="font-semibold">{event.counterpartyName}</p>
                  {event.counterpartyEmail ? (
                    <p className="text-xs text-muted-foreground">
                      {event.counterpartyEmail}
                    </p>
                  ) : null}
                  {!isHost && event.counterpartyRole ? (
                    <span className="inline-flex rounded-full bg-[#f7f9fa] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {hostRoleLabel(event.counterpartyRole)}
                    </span>
                  ) : null}
                  {event.enrolledCoursesLine ? (
                    <p className="text-xs text-muted-foreground">
                      {event.enrolledCoursesLine}
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="border-[#d1d7dc] bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Submitted
                    </p>
                    <p className="mt-1 text-xs text-[var(--foreground)]">
                      {formatCalendarEventTime(event.submittedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Preferred
                    </p>
                    <p className="mt-1 text-xs text-[var(--foreground)]">
                      {formatCalendarEventTime(event.preferredTime)}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Scheduled
                    </p>
                    <p className="mt-1 text-xs text-[var(--foreground)]">
                      {formatCalendarEventTime(event.scheduledAt)}
                    </p>
                  </div>
                  {event.openedAt ? (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        First join opened
                      </p>
                      <p className="mt-1 text-xs text-[var(--foreground)]">
                        {formatCalendarEventTime(event.openedAt)}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {event.message?.trim() ? (
                <Card className="border-[#d1d7dc] bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Message</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="rounded-lg border border-[#d1d7dc] bg-[#f7f9fa] px-3 py-2 text-xs leading-relaxed text-[var(--foreground)]">
                      {event.message.trim()}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-[#d1d7dc] pt-4">
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
          <p className="text-sm text-muted-foreground">Select a meeting slot.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
