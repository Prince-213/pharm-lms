"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { error: "Unauthorized" as const };
  }
  return { session };
}

export async function setUserActiveAction(
  userId: string,
  isActive: boolean,
  expectedRole: "STUDENT" | "TUTOR" | "MENTOR",
) {
  const admin = await assertAdmin();
  if ("error" in admin) return admin;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user) return { error: "User not found." as const };
  if (user.role !== expectedRole) {
    return { error: `This action only applies to ${expectedRole.toLowerCase()} accounts.` as const };
  }
  if (user.isActive === isActive) return { success: true as const };

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { isActive },
    }),
    db.auditLog.create({
      data: {
        actorId: admin.session.user.id,
        action: isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
        entityType: "User",
        entityId: userId,
        payload: { role: expectedRole },
      },
    }),
  ]);

  revalidatePath("/admin/students");
  revalidatePath("/admin/tutors");
  revalidatePath("/admin/mentors");
  revalidatePath("/admin/mentor-applications");
  revalidatePath("/admin/dashboard");

  return { success: true as const };
}
