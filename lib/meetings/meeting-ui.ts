import type { CalendarEventKind } from "@/lib/meetings/calendar-events";

export type MeetingBadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive";

export function meetingStatusBadgeProps(kind: CalendarEventKind): {
  variant: MeetingBadgeVariant;
  className?: string;
} {
  switch (kind) {
    case "pending_request":
      return {
        variant: "outline",
        className:
          "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
      };
    case "scheduled":
      return { variant: "secondary" };
    case "active":
      return { variant: "default" };
    case "completed":
      return { variant: "outline" };
    case "rejected":
    case "cancelled":
      return { variant: "destructive" };
    default:
      return { variant: "outline" };
  }
}

export function meetingAccentBorderClass(kind: CalendarEventKind): string {
  switch (kind) {
    case "pending_request":
      return "border-l-amber-500";
    case "scheduled":
      return "border-l-primary";
    case "active":
      return "border-l-primary";
    case "completed":
      return "border-l-muted-foreground/40";
    case "rejected":
    case "cancelled":
      return "border-l-destructive";
    default:
      return "border-l-border";
  }
}
