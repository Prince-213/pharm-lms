"use client";

import { CheckCircle2, Star } from "lucide-react";
import { useMemo, useState } from "react";
import type { MeetingAvailabilityRow } from "@/components/student/meeting-booking-modal";
import { MeetingBookingModal } from "@/components/student/meeting-booking-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  consultationBlockMinutes,
  formatNextOpeningLabel,
} from "@/lib/meetings/mentor-availability-helpers";

type InstructorBookingSidebarProps = {
  hostId: string;
  hostName: string;
  hostKind: "tutor" | "mentor";
  availability: MeetingAvailabilityRow[];
  timezoneLabel: string;
  enrolledCourses: { id: string; title: string }[];
  initialCourseId?: string | null;
  avgRating?: number | null;
  reviewCount?: number;
};

export function InstructorBookingSidebar({
  hostId,
  hostName,
  hostKind,
  availability,
  timezoneLabel,
  enrolledCourses,
  initialCourseId,
  avgRating,
  reviewCount,
}: InstructorBookingSidebarProps) {
  const enrolledCourseIds = enrolledCourses.map((c) => c.id);

  const [bookingCourseId, setBookingCourseId] = useState<string | undefined>(
    () => {
      if (initialCourseId && enrolledCourseIds.includes(initialCourseId)) {
        return initialCourseId;
      }
      if (enrolledCourseIds.length === 1) return enrolledCourseIds[0];
      return undefined;
    },
  );

  const nextOpen = formatNextOpeningLabel(availability);
  const sessionMins = consultationBlockMinutes(availability);
  const needsCoursePick =
    hostKind === "tutor" && enrolledCourses.length > 1 && !bookingCourseId;

  const bookingModal = useMemo(() => {
    if (hostKind === "mentor") {
      return (
        <MeetingBookingModal
          mentorId={hostId}
          mentorName={hostName}
          availability={availability}
          primaryCta="Book now"
        />
      );
    }

    if (enrolledCourseIds.length === 0) {
      return (
        <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-4 text-center text-xs leading-relaxed text-muted-foreground">
          Enroll in one of this tutor&apos;s courses to book a live session.
        </p>
      );
    }

    if (needsCoursePick) {
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Select a course for this booking:
          </p>
          <ul className="space-y-1.5">
            {enrolledCourses.map((course) => (
              <li key={course.id}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto w-full justify-start whitespace-normal px-3 py-2 text-left text-xs font-semibold"
                  onClick={() => setBookingCourseId(course.id)}
                >
                  {course.title}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <MeetingBookingModal
        courseId={bookingCourseId}
        mentorId={hostId}
        mentorName={hostName}
        availability={availability}
        primaryCta="Book now"
      />
    );
  }, [
    availability,
    bookingCourseId,
    enrolledCourseIds,
    hostId,
    hostKind,
    hostName,
    needsCoursePick,
  ]);

  return (
    <aside className="lg:sticky lg:top-6">
      <Card className="overflow-hidden shadow-md">
        {avgRating != null && reviewCount != null && reviewCount > 0 ? (
          <div className="border-b border-border bg-muted/40 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-foreground">
                {avgRating.toFixed(1)}
              </span>
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Based on {reviewCount.toLocaleString()} review
              {reviewCount === 1 ? "" : "s"}
            </p>
          </div>
        ) : null}

        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Book a session</CardTitle>
          <CardDescription>
            {hostKind === "tutor"
              ? "One-on-one video call aligned with your enrolled course."
              : "Private mentoring session — independent of course enrollment."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <ul className="space-y-3.5 text-sm">
            <li>
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Next availability
              </span>
              <p className="mt-1 font-semibold text-primary">{nextOpen}</p>
              <p className="text-[11px] text-muted-foreground">{timezoneLabel}</p>
            </li>
            <Separator />
            <li>
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Session length
              </span>
              <p className="mt-1 font-semibold text-foreground">{sessionMins} minutes</p>
            </li>
          </ul>

          {bookingModal}

          <div className="flex gap-2.5 rounded-xl bg-primary/5 p-3">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              strokeWidth={2}
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Sessions run on Jitsi. Your tutor confirms the time or suggests another slot
              that works.
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
