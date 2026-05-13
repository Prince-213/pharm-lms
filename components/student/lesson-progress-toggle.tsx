"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useProgress } from "@/lib/student/progress-context";
import { cn } from "@/lib/utils";

export function LessonProgressToggle({
  courseId: _courseId,
  lessonId,
  initialCompleted,
  variant = "default",
}: {
  courseId: string;
  lessonId: string;
  initialCompleted: boolean;
  variant?: "default" | "icon";
}) {
  const { progressMap, markAsComplete, isPending } = useProgress();
  const completed = progressMap[lessonId] || initialCompleted;

  const handleToggle = () => {
    if (completed) return;
    markAsComplete(lessonId);
  };

  if (variant === "icon") {
    const labelDone = "Lesson completed";
    const labelPending = "Mark lesson as complete";
    return (
      <button
        type="button"
        disabled={completed || isPending}
        onClick={handleToggle}
        title={completed ? labelDone : labelPending}
        aria-label={completed ? labelDone : labelPending}
        className={cn(
          "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[var(--foreground)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
          completed
            ? "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]"
            : "border-[#d1d7dc] bg-white hover:border-[var(--primary)]/40 hover:bg-[#fafafa]",
          isPending && "opacity-70",
        )}
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : completed ? (
          <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden />
        ) : (
          <Circle className="h-5 w-5 text-[var(--muted)]" aria-hidden />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={completed || isPending}
        onClick={handleToggle}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-default disabled:bg-[var(--success)] disabled:opacity-100"
      >
        {completed ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span>Lesson completed</span>
          </>
        ) : (
          "Mark lesson as completed"
        )}
      </button>
    </div>
  );
}
