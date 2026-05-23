import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { UserRole } from "@/generated/prisma/enums";

export type AuthenticatedApiSession = {
  user: {
    id: string;
    role: UserRole;
    email?: string | null;
    name?: string | null;
  };
};

type RequireApiSessionResult =
  | { session: AuthenticatedApiSession; error?: undefined }
  | { session?: undefined; error: NextResponse };

/**
 * Guard API route handlers by role. Returns a 401/403 response or the session.
 *
 * @example
 * const gate = await requireApiRoles(UserRole.STUDENT);
 * if (gate.error) return gate.error;
 * const { session } = gate;
 */
export async function requireApiRoles(
  ...roles: UserRole[]
): Promise<RequireApiSessionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!roles.includes(session.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return {
    session: {
      user: {
        id: session.user.id,
        role: session.user.role,
        email: session.user.email,
        name: session.user.name,
      },
    },
  };
}
