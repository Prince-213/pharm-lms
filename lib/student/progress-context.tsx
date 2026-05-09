"use client";

import React, { createContext, useContext, useOptimistic, useTransition } from "react";
import { setLessonCompletedAction } from "@/app/student/course/[courseId]/actions";
import { toast } from "sonner";

type ProgressContextType = {
  progressMap: Record<string, boolean>;
  markAsComplete: (lessonId: string) => Promise<void>;
  isPending: boolean;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({
  children,
  courseId,
  initialProgress,
}: {
  children: React.ReactNode;
  courseId: string;
  initialProgress: Record<string, boolean>;
}) {
  const [isPending, startTransition] = useTransition();
  
  // useOptimistic to handle instant UI updates
  const [optimisticProgress, addOptimisticProgress] = useOptimistic(
    initialProgress,
    (state, lessonId: string) => ({
      ...state,
      [lessonId]: true,
    })
  );

  const markAsComplete = async (lessonId: string) => {
    if (optimisticProgress[lessonId]) return;

    startTransition(async () => {
      addOptimisticProgress(lessonId);
      const res = await setLessonCompletedAction(courseId, lessonId, true);
      if (!res.ok) {
        toast.error(res.message || "Failed to save progress");
      } else {
        toast.success("Lesson completed!");
      }
    });
  };

  return (
    <ProgressContext.Provider value={{ progressMap: optimisticProgress, markAsComplete, isPending }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
