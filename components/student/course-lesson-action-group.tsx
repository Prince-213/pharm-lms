"use client";

import { LessonProgressToggle } from "@/components/student/lesson-progress-toggle";
import { SectionQuizLauncher } from "@/components/student/section-quiz-launcher";
import { ButtonGroup } from "@/components/ui/button-group";

type SectionQuiz = {
  id: string;
  title: string;
  questions: unknown;
};

export function CourseLessonActionGroup({
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
    <>
      <div className="pointer-events-none sticky bottom-4 z-[60] mt-10 flex justify-end pb-2 max-md:bottom-20 sm:bottom-6">
        <ButtonGroup className="pointer-events-auto shadow-lg">
          <LessonProgressToggle
            courseId={courseId}
            lessonId={lessonId}
            initialCompleted={initialCompleted}
            variant="button-group"
          />
          {quizzes.length > 0 ? (
            <SectionQuizLauncher
              quizzes={quizzes}
              triggerVariant="button-group"
            />
          ) : null}
        </ButtonGroup>
      </div>
    </>
  );
}
