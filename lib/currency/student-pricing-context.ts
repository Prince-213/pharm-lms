import { db } from "@/lib/db";
import { resolveCourseDisplayPrice } from "./resolve-course-display-price";
import { resolveDisplayCurrency } from "./resolve-display-currency";
import type { DisplayCurrency } from "./types";

export type StudentPricingContext = {
  displayCurrency: DisplayCurrency;
};

export async function getStudentPricingContext(
  userId: string | undefined,
): Promise<StudentPricingContext> {
  let profileCountry: string | null = null;
  if (userId) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { country: true },
    });
    profileCountry = user?.country ?? null;
  }

  const displayCurrency = await resolveDisplayCurrency({ profileCountry });
  return { displayCurrency };
}

export async function toDisplayCoursePrice(
  priceMinorUnitsNgn: number | null | undefined,
  displayCurrency: DisplayCurrency,
): Promise<{ priceMinorUnits: number | null; priceCurrency: DisplayCurrency }> {
  const resolved = await resolveCourseDisplayPrice(
    priceMinorUnitsNgn,
    displayCurrency,
  );
  return {
    priceMinorUnits: resolved.displayMinorUnits,
    priceCurrency: resolved.displayCurrency,
  };
}

export async function mapCoursesWithDisplayPrices<
  T extends { priceMinorUnits: number | null },
>(
  courses: T[],
  displayCurrency: DisplayCurrency,
): Promise<(T & { priceCurrency: DisplayCurrency })[]> {
  return Promise.all(
    courses.map(async (course) => {
      const display = await toDisplayCoursePrice(
        course.priceMinorUnits,
        displayCurrency,
      );
      return {
        ...course,
        priceMinorUnits: display.priceMinorUnits,
        priceCurrency: display.priceCurrency,
      };
    }),
  );
}
