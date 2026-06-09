"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import type { UserRole } from "@/generated/prisma/enums";

export function CrossSectorSessionGate({
  expectedRole,
  children,
}: {
  expectedRole: UserRole;
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const didTriggerSignOut = useRef(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.role) return;
    if (session.user.role === expectedRole) return;
    if (didTriggerSignOut.current) return;
    didTriggerSignOut.current = true;
    setSigningOut(true);
    const callbackUrl =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    void signOut({ callbackUrl });
  }, [status, session, expectedRole]);

  if (signingOut) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4 text-center text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--foreground)]">Signing out…</p>
        <p className="max-w-sm text-xs">
          Switching to this portal. You will be asked to sign in again.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
