"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCourseStudio } from "@/components/mentor/course-studio-context";
import { Button } from "@/components/ui/button";
import {
  activePlannerSegment,
  getPlannerStepBySegment,
  getPrevNextPlannerStep,
} from "@/lib/course-planner-steps";

export function CoursePlannerFloatingNav({ courseId }: { courseId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { readOnly, stepHandlers, navigationLocked } = useCourseStudio();
  const [busy, setBusy] = useState(false);

  const segment = activePlannerSegment(pathname);
  const currentStep = getPlannerStepBySegment(segment);
  const { prev, next } = getPrevNextPlannerStep(courseId, segment);

  if (!currentStep) return null;

  const disabled = readOnly || navigationLocked || busy;

  async function handleBack() {
    if (disabled || !prev) return;
    setBusy(true);
    try {
      const allowRoute = stepHandlers?.onBack
        ? await stepHandlers.onBack()
        : true;
      if (allowRoute) {
        router.push(prev.href);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleNext() {
    if (disabled || !next) return;
    setBusy(true);
    try {
      const allowRoute = stepHandlers?.onNext
        ? await stepHandlers.onNext()
        : true;
      if (allowRoute) {
        router.push(next.href);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed bottom-6 right-4 z-50 flex items-center gap-2 sm:right-6"
      aria-label="Course planner navigation"
    >
      <Button
        type="button"
        variant="outline"
        size="default"
        disabled={disabled || !prev}
        onClick={() => void handleBack()}
        className="gap-1.5 bg-background shadow-md"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </Button>
      <Button
        type="button"
        size="default"
        disabled={disabled || !next}
        onClick={() => void handleNext()}
        className="gap-1.5 shadow-md"
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
