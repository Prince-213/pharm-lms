"use server";

import { cookies } from "next/headers";
import type { UserRole } from "@/generated/prisma/enums";
import { parseUserRoleParam } from "@/lib/auth/wrong-portal";

export async function consumeWrongPortalRoleAction(): Promise<UserRole | null> {
  const store = await cookies();
  const raw = store.get("wrong_portal_as")?.value;
  store.delete("wrong_portal_as");
  return parseUserRoleParam(raw);
}
