"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { DisplayCurrency } from "@/lib/currency/types";

const PaidPurchaseSection = dynamic(
  () =>
    import("@/components/student/paid-purchase-section").then(
      (mod) => mod.PaidPurchaseSection,
    ),
  { ssr: false },
);

/** Client boundary so Paystack never enters the server component SSR graph. */
export function CatalogPaidPurchaseSection({
  courseId,
  basePriceMinorUnits,
  priceCurrency,
  displayCurrency,
  wishlist,
}: {
  courseId: string;
  basePriceMinorUnits: number;
  priceCurrency: string;
  displayCurrency?: DisplayCurrency;
  wishlist?: ReactNode;
}) {
  return (
    <PaidPurchaseSection
      courseId={courseId}
      basePriceMinorUnits={basePriceMinorUnits}
      priceCurrency={priceCurrency}
      displayCurrency={displayCurrency}
      wishlist={wishlist}
    />
  );
}
