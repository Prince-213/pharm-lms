"use client";

import { SessionProvider } from "next-auth/react";
import { SessionIdleExpiry } from "@/components/auth/session-idle-expiry";

export function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <SessionIdleExpiry />
      {children}
    </SessionProvider>
  );
}
