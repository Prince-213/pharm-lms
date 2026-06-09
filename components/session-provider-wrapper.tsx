"use client";

import { SessionProvider } from "next-auth/react";
import { SessionIdleExpiry } from "@/auth/session-idle-expiry";

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
