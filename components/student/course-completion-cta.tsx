"use client";

import { Award, CheckCircle2, PartyPopper, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { completeCourseAction } from "@/app/student/course/[courseId]/actions";
import { SafeHtml } from "@/components/ui/safe-html";
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
  const certificateHref = `/student/course/${courseId}/certificate`;
  const showCertificate =
    alreadyCompleted || (showCelebration && !isPending);

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeCourseAction(courseId);
      if (res.ok) {
        setShowCelebration(true);
        void import("canvas-confetti").then(({ default: confetti }) => {
          confetti({
            particleCount: 120,
            spread: 68,
            origin: { y: 0.58 },
            colors: ["#1e40af", "#3b82f6", "#3b82f6"],
          });
        });
      }
    });
  };

  if (!canComplete && !alreadyCompleted) return null;

  return (
    <>
      {showCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[var(--foreground)]/55 p-3 backdrop-blur-[2px] sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-celebration-title"
        >
          <div
            className={cn(
              "relative flex h-[70dvh] max-h-[70dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border)]",
              "bg-[var(--surface)] shadow-[var(--shadow-lg)] sm:h-[min(80vh,720px)] sm:max-h-none",
            )}
          >
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-muted-foreground transition hover:bg-[#fafafa] hover:text-[var(--foreground)] sm:right-4 sm:top-4"
              aria-label="Close celebration"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            <header className="shrink-0 border-b border-[var(--border)] px-5 pb-4 pt-10 text-center sm:px-8 sm:pt-12">
              <h2
                id="course-celebration-title"
                className="pr-10 text-xl font-bold tracking-tight text-[var(--foreground)] sm:pr-0 sm:text-3xl"
              >
                {congratulatoryTitle || "Course complete"}
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
                You have finished all required lessons. Your progress is saved
                and your completion is on record.
              </p>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
              <div className="w-full text-left">
                {congratsKind === "VIDEO" && congratulatoryVideoUrl ? (
                  <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[#0a0a0a] shadow-inner">
                    {/* biome-ignore lint/a11y/useMediaCaption: Mentor-uploaded congratulatory reel; captions not modeled in schema. */}
                    <video
                      src={congratulatoryVideoUrl}
                      controls
                      autoPlay
                      className="aspect-video max-h-[50dvh] w-full object-contain sm:max-h-none"
                    />
                  </div>
                ) : congratsKind === "ARTICLE" && congratulatoryArticle ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[#fafafa] p-4 sm:p-6">
                    <SafeHtml
                      html={congratulatoryArticle}
                      className="prose prose-sm max-w-none text-[var(--foreground)] sm:prose-base [&_a]:text-[var(--primary)]"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-primary/10 px-6 py-8 text-center">
                    <PartyPopper
                      className="mx-auto h-10 w-10 text-primary"
                      aria-hidden
                    />
                    <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                      Your completion badge is available on your profile.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <footer className="shrink-0 border-t border-[var(--border)] px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={certificateHref}
                  className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--primary)] bg-white px-6 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:bg-[var(--primary-soft)]"
                >
                  <Award className="h-4 w-4" aria-hidden />
                  View & print certificate
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void import("canvas-confetti").then(({ default: confetti }) => {
                      confetti({
                        particleCount: 64,
                        spread: 56,
                        origin: { y: 0.52 },
                        colors: ["#1e40af", "#3b82f6"],
                      });
                    });
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-strong)]"
                >
                  <PartyPopper className="h-4 w-4" aria-hidden />
                  Celebrate again
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {alreadyCompleted ? (
        <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-4 sm:px-5">
          <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm font-semibold text-[var(--foreground)]">
            <Trophy className="h-4 w-4 shrink-0 text-primary" />
            <span>Course completed</span>
            <button
              type="button"
              onClick={() => setShowCelebration(true)}
              className="text-sm font-semibold text-[var(--primary)] underline-offset-2 hover:underline"
            >
              View celebration
            </button>
          </p>
          {showCertificate ? (
            <div className="mt-3 flex justify-center">
              <Link
                href={certificateHref}
                className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-strong)]"
              >
                <Award className="h-4 w-4" aria-hidden />
                View & print certificate
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--primary)]/20 bg-linear-to-r from-[var(--primary)] to-[#3b82f6] p-[1px] shadow-sm">
          <div className="relative flex flex-col items-stretch justify-between gap-5 rounded-[calc(var(--radius-xl)-1px)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <div className="flex items-start gap-4 text-left sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-strong)] ring-1 ring-[var(--primary)]/15">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)] sm:text-lg">
                  Ready to finish?
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
