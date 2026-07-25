"use client";

import { SegmentError } from "@/components/ui/segment-error";

export default function TutorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SegmentError
      error={error}
      reset={reset}
      homeHref="/tutor/dashboard"
      homeLabel="Back to dashboard"
    />
  );
}
