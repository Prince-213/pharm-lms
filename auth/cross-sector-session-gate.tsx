"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import type { UserRole } from "@/generated/prisma/enums";
import { showWrongPortalToasts } from "@/lib/auth/wrong-portal-toast";
import { userRoleLabel } from "@/lib/user-role-label";

export function CrossSectorSessionGate({
  expectedRole,
  children,
}: {
  expectedRole: UserRole;
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const didNotify = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.role) return;
    if (session.user.role === expectedRole) return;
    if (didNotify.current) return;
    didNotify.current = true;
    showWrongPortalToasts({
      attemptedLabel: userRoleLabel(expectedRole),
      actualRole: session.user.role,
    });
  }, [status, session, expectedRole]);

  return <>{children}</>;
}
