"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

type AssertAdminResult =
  | { ok: false; error: "Unauthorized" }
  | { ok: true; userId: string };

async function assertAdmin(): Promise<AssertAdminResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return { ok: false, error: "Unauthorized" };
  }
  return { ok: true, userId: session.user.id };
}

const couponCodeRegex = /^[A-Z0-9_-]+$/;

const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "Code must be at least 4 characters.")
    .max(40, "Code must be at most 40 characters."),
  percentOff: z
    .number()
    .int()
    .min(1, "Discount must be at least 1%.")
    .max(99, "Discount cannot exceed 99%."),
  courseIds: z
    .array(z.string().min(1))
    .min(1, "Pick at least one course to target."),
  expiresAt: z.string().trim().optional().nullable(),
  maxRedemptions: z
    .number()
    .int()
    .min(1, "Total redemptions must be at least 1.")
    .max(1_000_000)
    .optional()
    .nullable(),
  maxRedemptionsPerStudent: z.number().int().min(1).max(100).default(1),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export type CreateCouponResult =
  | { ok: true; couponId: string }
  | { ok: false; message: string };

export async function createCouponAction(
  input: CreateCouponInput,
): Promise<CreateCouponResult> {
  const admin = await assertAdmin();
  if (!admin.ok) return { ok: false, message: admin.error };

  const parsed = createCouponSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Invalid input." };
  }

  const code = parsed.data.code.toUpperCase();
  if (!couponCodeRegex.test(code)) {
    return {
      ok: false,
      message:
        "Code may only contain letters, numbers, dashes, and underscores.",
    };
  }

  let expiresAtDate: Date | null = null;
  if (parsed.data.expiresAt) {
    const parsedDate = new Date(parsed.data.expiresAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return { ok: false, message: "Invalid expiration date." };
    }
    if (parsedDate.getTime() <= Date.now()) {
      return { ok: false, message: "Expiration date must be in the future." };
    }
    expiresAtDate = parsedDate;
  }

  const courseIds = Array.from(new Set(parsed.data.courseIds));
  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true },
  });
  if (courses.length !== courseIds.length) {
    return {
      ok: false,
      message: "One or more selected courses no longer exist.",
    };
  }

  try {
    const created = await db.coupon.create({
      data: {
        code,
        percentOff: parsed.data.percentOff,
        expiresAt: expiresAtDate,
        maxRedemptions: parsed.data.maxRedemptions ?? null,
        maxRedemptionsPerStudent: parsed.data.maxRedemptionsPerStudent,
        createdById: admin.userId,
        targets: {
          create: courseIds.map((courseId) => ({ courseId })),
        },
      },
      select: { id: true },
    });
    revalidatePath("/admin/coupons");
    return { ok: true, couponId: created.id };
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: string }).code)
        : "";
    if (code === "P2002") {
      return {
        ok: false,
        message: "A coupon with this code already exists.",
      };
    }
    console.error("createCouponAction failed", error);
    return { ok: false, message: "Could not create coupon." };
  }
}

export async function toggleCouponActiveAction(couponId: string) {
  const admin = await assertAdmin();
  if (!admin.ok) return { ok: false, message: admin.error };

  const coupon = await db.coupon.findUnique({
    where: { id: couponId },
    select: { id: true, isActive: true },
  });
  if (!coupon) return { ok: false, message: "Coupon not found." };

  await db.coupon.update({
    where: { id: couponId },
    data: { isActive: !coupon.isActive },
  });
  revalidatePath("/admin/coupons");
  return { ok: true as const, isActive: !coupon.isActive };
}

export async function deleteCouponAction(couponId: string) {
  const admin = await assertAdmin();
  if (!admin.ok) return { ok: false, message: admin.error };

  const coupon = await db.coupon.findUnique({
    where: { id: couponId },
    select: {
      id: true,
      _count: { select: { redemptions: true } },
    },
  });
  if (!coupon) return { ok: false, message: "Coupon not found." };

  if (coupon._count.redemptions > 0) {
    return {
      ok: false,
      message:
        "This coupon has been redeemed and can't be deleted. Deactivate it instead.",
    };
  }

  await db.coupon.delete({ where: { id: couponId } });
  revalidatePath("/admin/coupons");
  return { ok: true as const };
}

export type AdminCouponCourseOption = {
  id: string;
  title: string;
  priceMinorUnits: number | null;
  priceCurrency: string;
  mentorName: string;
};

/**
 * Server-side helper used by the dialog to list courses the admin can attach
 * a coupon to. Only published, paid courses are eligible.
 */
export async function listEligibleCoursesAction(): Promise<
  AdminCouponCourseOption[]
> {
  const admin = await assertAdmin();
  if (!admin.ok) return [];

  const courses = await db.course.findMany({
    where: {
      status: CourseStatus.PUBLISHED,
      priceMinorUnits: { gt: 0 },
    },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      priceMinorUnits: true,
      priceCurrency: true,
      mentor: { select: { fullName: true } },
    },
    take: 500,
  });

  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    priceMinorUnits: c.priceMinorUnits,
    priceCurrency: c.priceCurrency,
    mentorName: c.mentor.fullName,
  }));
}
