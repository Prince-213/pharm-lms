"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef } from "react";
import { IDLE_SIGN_OUT_MS } from "@/lib/auth/session-short-lived";

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "pointerdown",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
];

/**
 * Signs the user out after {@link IDLE_SIGN_OUT_MS} with no input events, and
 * pings `/api/auth/session` on activity so the JWT sliding expiry in `auth.ts`
 * can refresh while they are active.
 */
export function SessionIdleExpiry() {
  const { status } = useSession();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const touchSession = useCallback(() => {
    void fetch("/api/auth/session", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  }, []);

  const clearIdle = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  const scheduleIdle = useCallback(() => {
    clearIdle();
    idleTimer.current = setTimeout(() => {
      void signOut({ redirect: true, callbackUrl: "/" });
    }, IDLE_SIGN_OUT_MS);
  }, [clearIdle]);

  const schedulePing = useCallback(() => {
    if (pingTimer.current) {
      clearTimeout(pingTimer.current);
    }
    pingTimer.current = setTimeout(() => {
      touchSession();
      pingTimer.current = null;
    }, 500);
  }, [touchSession]);

  useEffect(() => {
    if (status !== "authenticated") {
      clearIdle();
      if (pingTimer.current) {
        clearTimeout(pingTimer.current);
        pingTimer.current = null;
      }
      return;
    }

    touchSession();
    scheduleIdle();

    const onActivity = () => {
      scheduleIdle();
      schedulePing();
    };

    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, onActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", onActivity);

    return () => {
      clearIdle();
      if (pingTimer.current) {
        clearTimeout(pingTimer.current);
        pingTimer.current = null;
      }
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, onActivity);
      }
      document.removeEventListener("visibilitychange", onActivity);
    };
  }, [status, scheduleIdle, schedulePing, touchSession, clearIdle]);

  return null;
}
