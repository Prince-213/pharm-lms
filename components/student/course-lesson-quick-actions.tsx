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
}: {
  courseId: string;
  lessonId: string;
  initialCompleted: boolean;
  quizzes: SectionQuiz[];
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2",
        "max-sm:mt-2 max-sm:w-full max-sm:justify-end",
      )}
    >
      <LessonProgressToggle
        courseId={courseId}
        lessonId={lessonId}
        initialCompleted={initialCompleted}
        variant="icon"
      />
      {quizzes.length > 0 ? (
        <SectionQuizLauncher quizzes={quizzes} triggerVariant="icon" />
      ) : null}
    </div>
  );
}
