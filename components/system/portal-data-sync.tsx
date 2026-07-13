"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export const PORTAL_MUTATION_EVENT = "pharm:portal-mutation";
const PORTAL_MUTATION_CHANNEL = "pharm-portal-mutation";

/**
 * Keeps dashboard server components fresh:
 * - refreshes when the tab becomes visible again
 * - refreshes when a client mutation broadcasts PORTAL_MUTATION_EVENT
 */
export function PortalDataSync() {
  const router = useRouter();
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }
      if (document.visibilityState !== "visible") return;
      const hiddenForMs = hiddenAtRef.current
        ? Date.now() - hiddenAtRef.current
        : 0;
      hiddenAtRef.current = null;
      if (hiddenForMs > 1500) {
        router.refresh();
      }
    }

    function onPortalMutation() {
      router.refresh();
    }

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(PORTAL_MUTATION_CHANNEL);
      channel.onmessage = () => router.refresh();
    } catch {
      channel = null;
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener(PORTAL_MUTATION_EVENT, onPortalMutation);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener(PORTAL_MUTATION_EVENT, onPortalMutation);
      channel?.close();
    };
  }, [router]);

  return null;
}
