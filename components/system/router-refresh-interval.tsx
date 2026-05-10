"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Periodically calls router.refresh() so server components pick up data changed
 * elsewhere (e.g. another user or tab). Pauses when the document is hidden.
 */
export function RouterRefreshInterval({
  intervalMs = 20_000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function tick() {
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      ) {
        return;
      }
      router.refresh();
    }

    intervalRef.current = setInterval(tick, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router, intervalMs]);

  return null;
}
