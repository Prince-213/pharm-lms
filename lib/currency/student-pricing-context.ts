import { db } from "@/lib/db";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
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

/** Geo/profile currency for any visitor (logged in or anonymous). */
export const getViewerPricingContext = getStudentPricingContext;

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

/** Formatted list/catalog price for the current visitor (NGN or USD). */
export async function formatCoursePriceForViewer(
  priceMinorUnitsNgn: number | null | undefined,
  viewerUserId?: string,
  options?: { zeroAsFree?: boolean },
): Promise<string> {
  const { displayCurrency } = await getStudentPricingContext(viewerUserId);
  const display = await toDisplayCoursePrice(
    priceMinorUnitsNgn,
    displayCurrency,
  );
  return formatMinorUnitsToCurrency(
    display.priceMinorUnits,
    display.priceCurrency,
    options,
  );
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
