"use client";

import confetti from "canvas-confetti";
import { CheckCircle2, PartyPopper, Trophy, X } from "lucide-react";
import { useState, useTransition } from "react";
import { completeCourseAction } from "@/app/student/course/[courseId]/actions";
import { cn } from "@/lib/utils";

interface CourseCompletionCtaProps {
  courseId: string;
  canComplete: boolean;
  alreadyCompleted: boolean;
  congratulatoryTitle?: string | null;
  congratulatoryContentType?: string | null;
  congratulatoryArticle?: string | null;
  congratulatoryVideoUrl?: string | null;
}

export function CourseCompletionCta({
  courseId,
  canComplete,
  alreadyCompleted,
  congratulatoryTitle,
  congratulatoryContentType,
  congratulatoryArticle,
  congratulatoryVideoUrl,
}: CourseCompletionCtaProps) {
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(alreadyCompleted);
  const congratsKind = congratulatoryContentType?.toUpperCase() ?? "";

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeCourseAction(courseId);
      if (res.ok) {
        setShowCelebration(true);
        confetti({
          particleCount: 120,
          spread: 68,
          origin: { y: 0.58 },
          colors: ["#10b981", "#3b82f6", "#0d9488"],
        });
      }
    });
  };

  if (!canComplete && !alreadyCompleted) return null;

  return (
    <>
      {showCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[var(--foreground)]/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-celebration-title"
        >
          <div
            className={cn(
              "relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)]",
              "bg-[var(--surface)] shadow-[var(--shadow-lg)]",
            )}
          >
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:bg-[#fafafa] hover:text-[var(--foreground)]"
              aria-label="Close celebration"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            <div className="px-6 pb-8 pt-10 text-center sm:px-10 sm:pb-10 sm:pt-12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)] ring-1 ring-[var(--success)]/20">
                <Trophy className="h-9 w-9" aria-hidden />
              </div>

              <h2
                id="course-celebration-title"
                className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl"
              >
                {congratulatoryTitle || "Course complete"}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                You have finished all required lessons. Your progress is saved
                and your completion is on record.
              </p>

              <div className="mt-8 w-full text-left">
                {congratsKind === "VIDEO" && congratulatoryVideoUrl ? (
                  <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[#0a0a0a] shadow-inner">
                    {/* biome-ignore lint/a11y/useMediaCaption: Mentor-uploaded congratulatory reel; captions not modeled in schema. */}
                    <video
                      src={congratulatoryVideoUrl}
                      controls
                      autoPlay
                      className="aspect-video w-full object-contain"
                    />
                  </div>
                ) : congratsKind === "ARTICLE" && congratulatoryArticle ? (
                  <div className="max-h-[min(400px,50vh)] overflow-y-auto rounded-xl border border-[var(--border)] bg-[#fafafa] p-5 sm:p-6">
                    <div
                      className="prose prose-sm max-w-none text-[var(--foreground)] sm:prose-base [&_a]:text-[var(--primary)]"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Mentor-authored congratulatory HTML.
                      dangerouslySetInnerHTML={{
                        __html: congratulatoryArticle,
                      }}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--success-soft)]/60 px-6 py-8 text-center">
                    <PartyPopper
                      className="mx-auto h-10 w-10 text-[var(--success)]"
                      aria-hidden
                    />
                    <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                      Your completion badge is available on your profile.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    confetti({
                      particleCount: 64,
                      spread: 56,
                      origin: { y: 0.52 },
                      colors: ["#10b981", "#3b82f6"],
                    });
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-strong)]"
                >
                  <PartyPopper className="h-4 w-4" aria-hidden />
                  Celebrate again
                </button>
                <button
                  type="button"
                  onClick={() => setShowCelebration(false)}
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-6 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[#fafafa]"
                >
                  Back to course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {alreadyCompleted ? (
        <div className="rounded-xl border border-[var(--success)]/25 bg-[var(--success-soft)]/50 px-4 py-3 text-center">
          <p className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Trophy className="h-4 w-4 shrink-0 text-[var(--success)]" />
            <span>Course completed</span>
            <button
              type="button"
              onClick={() => setShowCelebration(true)}
              className="text-sm font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
            >
              View celebration
            </button>
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--primary)]/20 bg-linear-to-r from-[var(--primary)] to-[#0d9488] p-[1px] shadow-sm">
          <div className="relative flex flex-col items-stretch justify-between gap-5 rounded-[calc(var(--radius-xl)-1px)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <div className="flex items-start gap-4 text-left sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-strong)] ring-1 ring-[var(--primary)]/15">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)] sm:text-lg">
                  Ready to finish?
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                  You have reached the end of the curriculum. Mark the course
                  complete to lock in your achievement.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              disabled={isPending}
              className={cn(
                "inline-flex h-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[10rem]",
              )}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden
                  />
                  Completing…
                </span>
              ) : (
                "Complete course"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
