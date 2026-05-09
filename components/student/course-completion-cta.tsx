"use client";

import { useTransition, useState } from "react";
import { CheckCircle2, PartyPopper, Trophy, X } from "lucide-react";
import confetti from "canvas-confetti";
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
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#f59e0b"],
        });
      }
    });
  };

  if (!canComplete && !alreadyCompleted) return null;

  return (
    <>
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/90 p-4 backdrop-blur-sm transition-all animate-in fade-in duration-500">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-700">
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="absolute right-6 top-6 z-10 rounded-full bg-slate-100 p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-6 w-6" strokeWidth={2} />
            </button>

            <div className="flex flex-col items-center p-8 text-center sm:p-12">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-inner">
                <Trophy className="h-14 w-14" />
              </div>
              
              <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {congratulatoryTitle || "Legendary Achievement!"}
              </h2>
              <p className="mt-4 max-w-md text-lg font-medium text-slate-500">
                You have successfully mastered this course and earned your certification. Your hard work has paid off!
              </p>

              <div className="mt-8 w-full">
                {congratsKind === "VIDEO" && congratulatoryVideoUrl ? (
                  <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-lg">
                    <video
                      src={congratulatoryVideoUrl}
                      controls
                      autoPlay
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : congratsKind === "ARTICLE" && congratulatoryArticle ? (
                  <div className="max-h-[400px] w-full overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-6 text-left shadow-inner">
                    <div 
                      className="prose prose-emerald max-w-none text-slate-800"
                      dangerouslySetInnerHTML={{ __html: congratulatoryArticle }}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-50 p-8">
                    <PartyPopper className="mx-auto h-12 w-12 text-emerald-600" />
                    <p className="mt-4 font-bold text-emerald-900">Your badge has been added to your profile.</p>
                  </div>
                )}
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => {
                    confetti({
                      particleCount: 80,
                      spread: 60,
                      origin: { y: 0.5 }
                    });
                  }}
                  className="inline-flex h-14 items-center gap-2 rounded-2xl bg-emerald-600 px-8 font-bold text-white shadow-xl shadow-emerald-200 transition hover:bg-emerald-700 active:scale-95"
                >
                  <PartyPopper className="h-6 w-6" />
                  Celebrate Again
                </button>
                <button
                  onClick={() => setShowCelebration(false)}
                  className="inline-flex h-14 items-center gap-2 rounded-2xl bg-slate-100 px-8 font-bold text-slate-900 transition hover:bg-slate-200"
                >
                  Back to Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {alreadyCompleted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
          <p className="text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4" />
            Course Completed! 
            <button 
              onClick={() => setShowCelebration(true)}
              className="ml-2 text-emerald-600 underline hover:text-emerald-700"
            >
              View celebration
            </button>
          </p>
        </div>
      ) : (
        <div className="group relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 p-1 shadow-xl transition-all hover:shadow-emerald-200/50">
          <div className="relative flex flex-col items-center justify-between gap-6 rounded-[14px] bg-white p-6 md:flex-row md:p-8">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Wrap up your learning</h3>
                <p className="text-slate-600">You've finished all lessons. Mark this course as complete to earn your badge.</p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={isPending}
              className={cn(
                "relative inline-flex h-14 min-w-[200px] items-center justify-center overflow-hidden rounded-xl bg-emerald-600 px-8 text-lg font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-70",
                isPending && "cursor-not-allowed"
              )}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Completing...
                </div>
              ) : (
                "Complete Course"
              )}
            </button>
          </div>

          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl" />
        </div>
      )}
    </>
  );
}
