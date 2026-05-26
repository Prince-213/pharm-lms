import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { validateCouponForCheckout } from "@/lib/coupons/validate-coupon";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await req.json().catch(() => null)) as {
      courseId?: string;
      code?: string;
    } | null;
    const courseId = body?.courseId;
    const code = body?.code;
    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json(
        { ok: false, message: "courseId required" },
        { status: 400 },
      );
    }
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { ok: false, message: "Enter a coupon code." },
        { status: 400 },
      );
    }

    const result = await validateCouponForCheckout({
      code,
      courseId,
      studentId: session.user.id,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      code: result.coupon.code,
      percentOff: result.coupon.percentOff,
      basePriceMinorUnits: result.basePriceMinorUnits,
      discountMinorUnits: result.discountMinorUnits,
      finalAmountMinorUnits: result.finalAmountMinorUnits,
    });
  } catch (e) {
    console.error("coupon validate", e);
    return NextResponse.json(
      { ok: false, message: "Could not validate coupon." },
      { status: 500 },
    );
  }
}
