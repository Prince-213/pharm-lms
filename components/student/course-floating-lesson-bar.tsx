"use client";

import { CourseLessonQuickActions } from "@/components/student/course-lesson-quick-actions";

type SectionQuiz = {
  id: string;
  title: string;
  questions: unknown;
};

export function CourseFloatingLessonBar({
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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-6">
      <div className="pointer-events-auto flex w-full max-w-xl items-center justify-center gap-2 rounded-2xl border border-[#d1d7dc] bg-white/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
        <CourseLessonQuickActions
          courseId={courseId}
          lessonId={lessonId}
          initialCompleted={initialCompleted}
          quizzes={quizzes}
          size="md"
          labeled
        />
      </div>
    </div>
  );
}
