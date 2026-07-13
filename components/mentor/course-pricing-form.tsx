"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import { useCourseStudio } from "@/components/mentor/course-studio-context";
import { cn } from "@/lib/utils";

/** Stored as minor units (kobo): 1 NGN = 100 kobo */
function formatNairaFromMinor(minor: number | null) {
  if (minor === null || minor === undefined) return "";
  const naira = minor / 100;
  if (naira === 0) return "Free";
  return `₦${naira.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export function CoursePricingForm({
  courseId,
  initialMinorUnits,
}: {
  courseId: string;
  initialMinorUnits: number | null;
}) {
  const { readOnly, registerStepHandlers } = useCourseStudio();
  const router = useRouter();
  const [isFree, setIsFree] = useState(initialMinorUnits === 0);
  const [nairaInput, setNairaInput] = useState(() => {
    if (initialMinorUnits == null || initialMinorUnits === 0) return "";
    return String(Math.floor(initialMinorUnits / 100));
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const priceMinorUnits = useMemo(() => {
    if (isFree) return 0;
    return (
      Math.floor(Number.parseInt(nairaInput.replace(/[^\d]/g, ""), 10) || 0) *
      100
    );
  }, [isFree, nairaInput]);

  function validateForNext(): boolean {
    if (isFree || priceMinorUnits > 0) {
      setFieldErrors({});
      return true;
    }
    setFieldErrors({
      price: "Enter a price in Naira or mark the course as free.",
    });
    document.getElementById("price-naira")?.focus();
    toast.error("Set pricing before continuing.");
    return false;
  }

  useEffect(() => {
    registerStepHandlers({
      navigationLocked: saving,
      onNext: () => validateForNext(),
    });
    return () => registerStepHandlers(null);
  }, [registerStepHandlers, isFree, priceMinorUnits, saving]);

  const preview = useMemo(() => {
    if (isFree) return "Free";
    const n = Number.parseInt(nairaInput.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(n) || n < 0) return "";
    return formatNairaFromMinor(n * 100);
  }, [isFree, nairaInput]);

  async function save() {
    if (!validateForNext()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/tutor/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceMinorUnits }),
      });
      if (!response.ok) {
        toast.error("Could not save price.");
        return;
      }
      toast.success("Pricing saved.");
      refreshPortalAfterMutation(router);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 px-6 py-5">
      {readOnly ? (
        <p className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-muted-foreground">
          This course is pending review. Pricing is locked.
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Prices are in Nigerian Naira (NGN). Stored as minor units (₦1 = 100
        kobo).
      </p>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isFree}
          disabled={readOnly}
          onChange={(e) => {
            setIsFree(e.target.checked);
            if (e.target.checked) setNairaInput("");
            if (fieldErrors.price) {
              setFieldErrors({});
            }
          }}
          className="h-4 w-4 rounded border-[var(--border)]"
        />
        <span className="text-sm font-semibold">This course is free</span>
      </label>

      <div className="grid max-w-[420px] gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-foreground">Currency</label>
          <div className="flex h-10 items-center border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm font-medium">
            NGN (₦)
          </div>
        </div>
        <div>
          <label
            htmlFor="price-naira"
            className="mb-1 block text-xs font-bold text-foreground"
          >
            Price (Naira)
          </label>
          <input
            id="price-naira"
            type="text"
            inputMode="numeric"
            disabled={readOnly || isFree}
            value={isFree ? "" : nairaInput}
            onChange={(e) => {
              setNairaInput(e.target.value.replace(/[^\d]/g, ""));
              if (fieldErrors.price) {
                setFieldErrors({});
              }
            }}
            placeholder={isFree ? "—" : "e.g. 15000"}
            className={cn(
              "h-10 w-full border bg-white px-3 text-sm disabled:bg-[var(--surface-muted)]",
              fieldErrors.price ? "border-destructive" : "border-[var(--border)]",
            )}
          />
          {fieldErrors.price ? (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.price}</p>
          ) : null}
        </div>
      </div>

      {preview ? (
        <p className="text-sm text-[var(--foreground)]">
          Selected: <strong>{preview}</strong>
        </p>
      ) : null}

      <button
        type="button"
        disabled={readOnly || saving || (!isFree && !nairaInput.trim())}
        onClick={() => void save()}
        className="rounded-sm bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
