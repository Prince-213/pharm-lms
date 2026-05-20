"use client";

import { LessonProgressToggle } from "@/components/student/lesson-progress-toggle";
import { SectionQuizLauncher } from "@/components/student/section-quiz-launcher";
import { cn } from "@/lib/utils";

type SectionQuiz = {
  id: string;
  title: string;
  questions: unknown;
};

export function CourseLessonQuickActions({
  courseId,
  lessonId,
  initialCompleted,
  quizzes,
  size = "md",
  labeled = false,
}: {
  courseId: string;
  lessonId: string;
  initialCompleted: boolean;
  quizzes: SectionQuiz[];
  size?: "sm" | "md";
  /** Icon + visible label for mobile/tablet lesson bar. */
  labeled?: boolean;
}) {
  const triggerVariant = labeled ? "labeled" : "icon";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2",
        size === "md" && "max-sm:mt-2 max-sm:w-full max-sm:justify-end",
      )}
    >
      <LessonProgressToggle
        courseId={courseId}
        lessonId={lessonId}
        initialCompleted={initialCompleted}
        variant={triggerVariant}
        className={!labeled && size === "sm" ? "h-9 w-9" : ""}
      />
      {quizzes.length > 0 ? (
        <SectionQuizLauncher
          quizzes={quizzes}
          triggerVariant={triggerVariant}
          size={size === "sm" ? "sm" : "default"}
        />
      ) : null}
    </div>
  );
}
