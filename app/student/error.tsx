"use client";

import { SegmentError } from "@/components/ui/segment-error";

export default function StudentError({
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
      homeHref="/student/dashboard"
      homeLabel="Back to dashboard"
    />
  );
}
