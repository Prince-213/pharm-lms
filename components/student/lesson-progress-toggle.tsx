"use client";

import { CheckCircle2, Loader2, NotebookPen } from "lucide-react";
import { LabeledIconButton } from "@/components/student/labeled-icon-button";
import { useProgress } from "@/lib/student/progress-context";
import { cn } from "@/lib/utils";

export function LessonProgressToggle({
  courseId: _courseId,
  lessonId,
  initialCompleted,
  variant = "default",
  className,
}: {
  courseId: string;
  lessonId: string;
  initialCompleted: boolean;
  variant?: "default" | "icon" | "labeled";
  className?: string;
}) {
  const { progressMap, markAsComplete, isPending } = useProgress();
  const completed = progressMap[lessonId] || initialCompleted;

  const handleToggle = () => {
    if (completed) return;
    markAsComplete(lessonId);
  };

  if (variant === "labeled") {
    const labelDone = "Lesson completed";
    const labelPending = "Mark lesson as complete";
    const visibleLabel = completed ? "Done" : "Complete";
    const Icon = isPending
      ? Loader2
      : completed
        ? CheckCircle2
        : NotebookPen;
    return (
      <LabeledIconButton
        icon={Icon}
        label={visibleLabel}
        ariaLabel={completed ? labelDone : labelPending}
        tone={completed ? "success" : "default"}
        disabled={completed || isPending}
        onClick={handleToggle}
        className={cn(isPending && "[&_svg]:animate-spin", className)}
      />
    );
  }

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
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-white hover:border-primary/40 hover:bg-muted/40",
          isPending && "opacity-70",
          className,
        )}
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : completed ? (
          <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
        ) : (
          <NotebookPen className="h-5 w-5 text-muted-foreground" aria-hidden />
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
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-[var(--primary-strong)] disabled:cursor-default disabled:bg-primary/80 disabled:opacity-100"
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
