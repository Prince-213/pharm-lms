"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  User,
  Video,
} from "lucide-react";
import { MeetingRequestActions } from "@/components/meetings/meeting-request-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { meetingStatusBadgeProps } from "@/lib/meetings/meeting-ui";

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

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TimelineRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
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
        className="flex w-full flex-col border-border p-0 sm:max-w-md"
      >
        {event ? (
          <>
            <SheetHeader className="space-y-3 border-b border-border px-5 py-4 text-left">
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <Badge {...meetingStatusBadgeProps(event.kind)}>
                  {event.displayStatus}
                </Badge>
                {event.courseTitle ? (
                  <Badge variant="outline" className="max-w-full truncate">
                    {event.courseTitle}
                  </Badge>
                ) : null}
              </div>
              <SheetTitle className="font-display text-lg leading-snug">
                {event.label}
              </SheetTitle>
              <SheetDescription className="text-left">
                {isHost ? "Meeting request" : "Session details"}
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <Card className="border-primary/20 bg-primary/5 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {event.scheduledAt ? "Scheduled" : "Preferred time"}
                    </p>
                    <p className="truncate text-sm font-semibold tabular-nums text-foreground">
                      {formatCalendarEventTime(
                        event.scheduledAt ?? event.preferredTime,
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isHost ? "Student" : "Host"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-start gap-3 pt-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {initialsFromName(event.counterpartyName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate font-semibold text-foreground">
                      {event.counterpartyName}
                    </p>
                    {event.counterpartyEmail ? (
                      <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        {event.counterpartyEmail}
                      </p>
                    ) : null}
                    {!isHost && event.counterpartyRole ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {hostRoleLabel(event.counterpartyRole)}
                      </Badge>
                    ) : null}
                    {event.enrolledCoursesLine ? (
                      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <User className="mt-0.5 h-3 w-3 shrink-0" />
                        <span className="line-clamp-2">
                          {event.enrolledCoursesLine}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border pt-0">
                  <TimelineRow
                    icon={Clock}
                    label="Submitted"
                    value={formatCalendarEventTime(event.submittedAt)}
                  />
                  <TimelineRow
                    icon={Clock}
                    label="Preferred"
                    value={formatCalendarEventTime(event.preferredTime)}
                  />
                  <TimelineRow
                    icon={Clock}
                    label="Scheduled"
                    value={formatCalendarEventTime(event.scheduledAt)}
                  />
                  {event.openedAt ? (
                    <TimelineRow
                      icon={Clock}
                      label="First join opened"
                      value={formatCalendarEventTime(event.openedAt)}
                    />
                  ) : null}
                </CardContent>
              </Card>

              {event.message?.trim() ? (
                <Card className="shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm leading-relaxed text-foreground">
                      {event.message.trim()}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-border bg-muted/30 px-5 py-4">
              {event.canAcceptReject ? (
                <MeetingRequestActions
                  meetingRequestId={event.meetingRequestId}
                  preferredTime={
                    event.preferredTime
                      ? new Date(event.preferredTime)
                      : null
                  }
                  onSuccess={() => onOpenChange(false)}
                />
              ) : null}

              {event.joinable && event.joinHref ? (
                <Button asChild className="w-full">
                  <Link href={event.joinHref}>
                    <Video className="h-4 w-4" />
                    Join meeting
                  </Link>
                </Button>
              ) : null}

              {!isHost && event.counterpartyId ? (
                <Button variant="outline" asChild className="w-full">
                  <Link
                    href={
                      event.counterpartyRole === UserRole.MENTOR
                        ? `/student/mentors/${event.counterpartyId}`
                        : `/student/tutors/${event.counterpartyId}`
                    }
                  >
                    View {hostRoleLabel(event.counterpartyRole).toLowerCase()}{" "}
                    profile
                  </Link>
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="p-5 text-sm text-muted-foreground">
            Select a meeting slot.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
