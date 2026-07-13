"use client";

import { CheckCircle2, Star } from "lucide-react";
import { useMemo, useState } from "react";
import type { MeetingAvailabilityRow } from "@/components/student/meeting-booking-modal";
import { MeetingBookingModal } from "@/components/student/meeting-booking-modal";
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
        <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4 text-center text-xs leading-relaxed text-muted-foreground">
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
                <button
                  type="button"
                  onClick={() => setBookingCourseId(course.id)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/50 px-3 py-2 text-left text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]/40 hover:bg-[var(--primary-soft)]/20"
                >
                  {course.title}
                </button>
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
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        {avgRating != null && reviewCount != null && reviewCount > 0 ? (
          <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]/40 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-[var(--ink-deep)]">
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

        <div className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-[var(--ink-deep)]">
            Book a session
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {hostKind === "tutor"
              ? "One-on-one video call aligned with your enrolled course."
              : "Private mentoring session — independent of course enrollment."}
          </p>

          <ul className="mt-5 space-y-3.5 text-sm">
            <li className="border-b border-[var(--border-subtle)] pb-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Next availability
              </span>
              <p className="mt-1 font-semibold text-[var(--primary)]">{nextOpen}</p>
              <p className="text-[11px] text-muted-foreground">{timezoneLabel}</p>
            </li>
            <li>
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Session length
              </span>
              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {sessionMins} minutes
              </p>
            </li>
          </ul>

          <div className="mt-5">{bookingModal}</div>

          <div className="mt-5 flex gap-2.5 rounded-xl bg-[var(--primary-soft)]/25 p-3">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]"
              strokeWidth={2}
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Sessions run on Jitsi. Your tutor confirms the time or suggests
              another slot that works.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
