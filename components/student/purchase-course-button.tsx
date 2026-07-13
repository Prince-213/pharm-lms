"use client";

import dynamic from "next/dynamic";
import { LoadingButton } from "@/components/ui/loading-button";
import type { DisplayCurrency } from "@/lib/currency/types";

type PurchaseCourseButtonProps = {
  courseId: string;
  className?: string;
  displayCurrency?: DisplayCurrency;
  coupon?: { code: string } | null;
};

/** Paystack inline JS reads `window` at import time — never load during SSR. */
const PurchaseCourseButtonClient = dynamic(
  () =>
    import("@/components/student/purchase-course-button-paystack").then(
      (mod) => mod.PurchaseCourseButtonPaystack,
    ),
  {
    ssr: false,
    loading: () => (
      <LoadingButton
        type="button"
        disabled
        loading
        loadingLabel="Loading checkout…"
        className="w-full rounded-[var(--radius-md)] py-3 text-sm font-bold shadow-[var(--shadow-sm)]"
        size="lg"
      >
        Buy now
      </LoadingButton>
    ),
  },
);

export function PurchaseCourseButton(props: PurchaseCourseButtonProps) {
  return <PurchaseCourseButtonClient {...props} />;
}
