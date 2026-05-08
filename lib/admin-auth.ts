import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/admin/login");
  }
  return session;
}

export async function getAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) return null;
  return session;
}
