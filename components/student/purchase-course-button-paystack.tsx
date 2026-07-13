"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { usePaystackPayment } from "react-paystack";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import type { DisplayCurrency } from "@/lib/currency/types";
import { toUserFacingError } from "@/lib/user-facing-error";

export function PurchaseCourseButtonPaystack({
  courseId,
  className,
  displayCurrency,
  coupon,
}: {
  courseId: string;
  className?: string;
  displayCurrency?: DisplayCurrency;
  coupon?: { code: string } | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paystackOpen, setPaystackOpen] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

  const initializePayment = usePaystackPayment({
    publicKey,
  });

  const onPay = useCallback(() => {
    if (!publicKey.trim()) {
      toast.error("Payments are not configured. Please try again later.");
      return;
    }
    const toastId = toast.loading("Preparing checkout…");
    startTransition(async () => {
      try {
        const res = await fetch("/api/payments/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            couponCode: coupon?.code ?? undefined,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          reEnrolled?: boolean;
          courseId?: string;
          reference?: string;
          amount?: number;
          email?: string | null;
          publicKey?: string;
        };
        if (!res.ok) {
          toast.error(
            toUserFacingError(data.error, "Could not start checkout."),
            { id: toastId },
          );
          return;
        }
        if (data.reEnrolled && data.courseId) {
          toast.success("You're enrolled — opening your course.", { id: toastId });
          router.push(`/student/course/${data.courseId}`);
          refreshPortalAfterMutation(router);
          return;
        }
        if (
          !data.reference ||
          data.amount == null ||
          !data.email ||
          !data.publicKey
        ) {
          toast.error("Could not start checkout. Please try again.", {
            id: toastId,
          });
          return;
        }

        toast.dismiss(toastId);
        setPaystackOpen(true);
        const init = {
          reference: data.reference,
          amount: data.amount,
          email: data.email,
        };

        initializePayment({
          config: {
            email: init.email!,
            amount: init.amount,
            reference: init.reference,
            currency: "NGN",
          },
          onSuccess: () => {
            const verifyId = toast.loading("Confirming payment…");
            void (async () => {
              try {
                const v = await fetch("/api/payments/paystack/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ reference: init.reference }),
                });
                const vr = (await v.json().catch(() => ({}))) as {
                  error?: string;
                  courseId?: string;
                };
                if (!v.ok) {
                  toast.error(
                    toUserFacingError(vr.error, "Could not verify payment."),
                    { id: verifyId },
                  );
                  return;
                }
                toast.success("Payment successful — opening your course.", {
                  id: verifyId,
                });
                router.push(`/student/course/${vr.courseId ?? courseId}`);
                refreshPortalAfterMutation(router);
              } catch {
                toast.error("Could not verify payment.", { id: verifyId });
              } finally {
                setPaystackOpen(false);
              }
            })();
          },
          onClose: () => {
            setPaystackOpen(false);
            toast.message("Payment window closed.");
          },
        });
      } catch {
        toast.error("Network error. Check your connection and try again.", {
          id: toastId,
        });
      }
    });
  }, [courseId, coupon, initializePayment, publicKey, router]);

  const showNgnChargeNote = displayCurrency === "USD";
  const loading = pending || paystackOpen;

  return (
    <div className="flex w-full min-w-0 flex-col items-stretch gap-1">
      <LoadingButton
        type="button"
        disabled={loading}
        loading={loading}
        loadingLabel={pending ? "Preparing checkout…" : "Complete payment in popup…"}
        onClick={onPay}
        className={`w-full rounded-[var(--radius-md)] py-3 text-sm font-bold shadow-[var(--shadow-sm)]${className ? ` ${className}` : ""}`}
        size="lg"
      >
        Buy now
      </LoadingButton>
      {showNgnChargeNote ? (
        <p className="text-[11px] leading-snug text-muted-foreground">
          You will be charged in Nigerian Naira (NGN) at the current exchange
          rate.
        </p>
      ) : null}
    </div>
  );
}
