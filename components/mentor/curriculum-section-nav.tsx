"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CurriculumSectionNav({
  currentIndex,
  totalSections,
  onBack,
  onNext,
  backDisabled,
  nextDisabled,
  nextLabel = "Next section",
}: {
  currentIndex: number;
  totalSections: number;
  onBack: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  if (totalSections === 0) return null;

  return (
    <div className="sticky bottom-0 z-20 -mx-3 mt-6 border-t border-[#d1d7dc] bg-[#f7f9fa]/95 px-3 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-[var(--muted)]">
          Section {currentIndex + 1} of {totalSections}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={backDisabled || currentIndex === 0}
            onClick={onBack}
            className="gap-1 border-[#d1d7dc] bg-white text-sm"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={nextDisabled || currentIndex >= totalSections - 1}
            onClick={onNext}
            className="gap-1 text-sm"
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
