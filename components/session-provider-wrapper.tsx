"use client";

import { SessionProvider } from "next-auth/react";
import { SessionIdleExpiry } from "@/auth/session-idle-expiry";
import { WebPushRegistrar } from "@/components/notifications/web-push-registrar";

export function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <SessionIdleExpiry />
      <WebPushRegistrar />
      {children}
    </SessionProvider>
  );
}
