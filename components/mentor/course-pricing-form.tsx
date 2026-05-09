"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCourseStudio } from "@/components/mentor/course-studio-context";

/** Stored as minor units (kobo): 1 NGN = 100 kobo */
const PRICE_TIERS_NGN = [
  0, 2500, 5000, 10000, 15000, 25000, 50000, 75000, 100000,
] as const;

function formatNairaFromMinor(minor: number | null) {
  if (minor === null || minor === undefined) return "";
  const naira = minor / 100;
  if (naira === 0) return "Free";
  return `₦${naira.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function tierChoices(initialMinorUnits: number | null) {
  const set = new Set<number>(PRICE_TIERS_NGN);
  if (initialMinorUnits != null) set.add(initialMinorUnits);
  return [...set].sort((a, b) => a - b);
}

export function CoursePricingForm({
  courseId,
  initialMinorUnits,
}: {
  courseId: string;
  initialMinorUnits: number | null;
}) {
  const { readOnly } = useCourseStudio();
  const router = useRouter();
  const choices = useMemo(
    () => tierChoices(initialMinorUnits),
    [initialMinorUnits],
  );
  const [tier, setTier] = useState<string>(
    initialMinorUnits != null ? String(initialMinorUnits) : "",
  );
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    const v = Number(tier);
    if (Number.isNaN(v)) return "";
    return formatNairaFromMinor(v);
  }, [tier]);

  async function save() {
    if (tier === "") {
      toast.error("Select a price tier.");
      return;
    }
    const priceMinorUnits = Number(tier);
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
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 px-6 py-5">
      {readOnly ? (
        <p className="rounded border border-[#d1d7dc] bg-[#f6f7f9] p-3 text-sm text-[#6a6f73]">
          This course is pending review. Pricing is locked.
        </p>
      ) : null}

      <p className="text-sm text-[#6a6f73]">
        Prices are in Nigerian Naira (NGN). Amounts include VAT-style precision
        in kobo (stored as minor units: ₦1 = 100).
      </p>

      <div className="grid max-w-[420px] gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold">Currency</label>
          <div className="flex h-10 items-center border border-[#d1d7dc] bg-[#f6f7f9] px-3 text-sm font-medium">
            NGN (₦)
          </div>
        </div>
        <div>
          <label
            htmlFor="price-tier"
            className="mb-1 block text-xs font-semibold"
          >
            Price tier
          </label>
          <select
            id="price-tier"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            disabled={readOnly}
            className="h-10 w-full border border-[#d1d7dc] bg-white px-2 text-sm disabled:bg-[#f6f7f9]"
          >
            <option value="">— Select —</option>
            {choices.map((minor) => (
              <option key={minor} value={String(minor)}>
                {formatNairaFromMinor(minor)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {preview ? (
        <p className="text-sm text-[#1c1d1f]">
          Selected: <strong>{preview}</strong>
        </p>
      ) : null}


      <button
        type="button"
        disabled={readOnly || saving || tier === ""}
        onClick={() => void save()}
        className="rounded-sm bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
