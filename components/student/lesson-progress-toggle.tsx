"use client";

import { CheckCircle2 } from "lucide-react";
import { useProgress } from "@/lib/student/progress-context";

export function LessonProgressToggle({
  courseId,
  lessonId,
  initialCompleted,
}: {
  courseId: string;
  lessonId: string;
  initialCompleted: boolean;
}) {
  const { progressMap, markAsComplete, isPending } = useProgress();
  const completed = progressMap[lessonId] || initialCompleted;

  const handleToggle = () => {
    if (completed) return;
    markAsComplete(lessonId);
  };

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
