"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { usePaystackPayment } from "react-paystack";
import { toast } from "sonner";

const btnCatalog =
  "w-full rounded-[var(--radius-md)] bg-[var(--primary)] px-6 py-3 text-sm font-bold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--primary-strong)] disabled:opacity-50";

export function PurchaseCourseButton({
  courseId,
  className,
}: {
  courseId: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

  const initializePayment = usePaystackPayment({
    publicKey,
  });

  const onPay = useCallback(() => {
    setMsg(null);
    if (!publicKey.trim()) {
      setMsg("Payments are not configured (missing public key).");
      return;
    }
    startTransition(async () => {
      let init: {
        reference: string;
        amount: number;
        email: string | null;
        publicKey: string;
        currency?: string;
      };
      try {
        const res = await fetch("/api/payments/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          reEnrolled?: boolean;
          courseId?: string;
          reference?: string;
          amount?: number;
          email?: string | null;
          publicKey?: string;
          currency?: string;
        };
        if (!res.ok) {
          setMsg(data.error ?? "Could not start checkout.");
          return;
        }
        if (data.reEnrolled && data.courseId) {
          toast.success("You're enrolled again — opening your course.");
          router.push(`/student/course/${data.courseId}`);
          router.refresh();
          return;
        }
        if (
          !data.reference ||
          data.amount == null ||
          !data.email ||
          !data.publicKey
        ) {
          setMsg("Invalid checkout response.");
          return;
        }
        init = {
          reference: data.reference,
          amount: data.amount,
          email: data.email,
          publicKey: data.publicKey,
          currency: data.currency,
        };
      } catch {
        setMsg("Network error. Try again.");
        return;
      }

      initializePayment({
        config: {
          email: init.email!,
          amount: init.amount,
          reference: init.reference,
          currency: (init.currency as "NGN") ?? "NGN",
        },
        onSuccess: () => {
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
                toast.error(vr.error ?? "Could not verify payment.");
                return;
              }
              toast.success("Payment successful — opening your course.");
              router.push(`/student/course/${vr.courseId ?? courseId}`);
              router.refresh();
            } catch {
              toast.error("Could not verify payment.");
            }
          })();
        },
        onClose: () => {
          toast.message("Payment window closed.");
        },
      });
    });
  }, [courseId, initializePayment, publicKey, router]);

  return (
    <div className="flex w-full min-w-0 flex-col items-stretch gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={onPay}
        className={`${btnCatalog}${className ? ` ${className}` : ""}`}
      >
        {pending ? "Preparing checkout…" : "Buy now"}
      </button>
      {msg ? <p className="text-xs text-rose-700">{msg}</p> : null}
    </div>
  );
}
