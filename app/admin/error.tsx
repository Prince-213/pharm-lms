"use client";

import { SegmentError } from "@/components/ui/segment-error";

export default function AdminError({
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
      homeHref="/admin/dashboard"
      homeLabel="Back to dashboard"
    />
  );
}
