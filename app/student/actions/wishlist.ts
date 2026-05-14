"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { db } from "@/lib/db";

export type WishlistResult =
  | { ok: true; saved: boolean }
  | { ok: false; message: string };

async function requireStudent() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) return null;
  return session.user;
}

export async function toggleWishlistAction(
  courseId: string,
): Promise<WishlistResult> {
  const user = await requireStudent();
  if (!user) {
    return {
      ok: false,
      message: "Sign in with a student account to use the wishlist.",
    };
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, status: true },
  });
  if (!course || course.status !== CourseStatus.PUBLISHED) {
    return { ok: false, message: "This course is not available." };
  }

  const existing = await db.wishlist.findUnique({
    where: { studentId_courseId: { studentId: user.id, courseId } },
    select: { id: true },
  });

  if (existing) {
    await db.wishlist.delete({ where: { id: existing.id } });
    revalidateWishlistPaths(courseId);
    return { ok: true, saved: false };
  }

  try {
    await db.wishlist.create({
      data: { studentId: user.id, courseId },
    });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: string }).code)
        : "";
    if (code !== "P2002") throw error;
  }
  revalidateWishlistPaths(courseId);
  void evaluateStudentBadges(user.id);
  return { ok: true, saved: true };
}

function revalidateWishlistPaths(courseId: string) {
  revalidatePath("/student/wishlist");
  revalidatePath("/student/browse");
  revalidatePath(`/student/browse/${courseId}`);
  revalidatePath("/student/dashboard");
}
