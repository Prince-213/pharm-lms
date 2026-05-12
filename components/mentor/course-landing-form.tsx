"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCourseStudio } from "@/components/mentor/course-studio-context";
import { RichTextArea } from "@/components/rich-text-area";
import { FileUploader } from "@/components/upload/file-uploader";

export type CourseLandingInitial = {
  title: string;
  subtitle: string | null;
  description: string;
  language: string | null;
  level: string | null;
  category: string | null;
  subcategory: string | null;
  primaryTopic: string | null;
  thumbnailUrl: string | null;
  promoVideoUrl: string | null;
  estimatedDurationMinutes: number | null;
};

function plainTextLength(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

export function CourseLandingForm({
  courseId,
  initial,
}: {
  courseId: string;
  initial: CourseLandingInitial;
}) {
  const { readOnly } = useCourseStudio();
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle ?? "");
  const [description, setDescription] = useState(initial.description);
  const [language, setLanguage] = useState(initial.language ?? "English");
  const [level, setLevel] = useState(initial.level ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [subcategory, setSubcategory] = useState(initial.subcategory ?? "");
  const [primaryTopic, setPrimaryTopic] = useState(initial.primaryTopic ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial.thumbnailUrl ?? "");
  const [promoVideoUrl, setPromoVideoUrl] = useState(
    initial.promoVideoUrl ?? "",
  );
  const initialDur = initial.estimatedDurationMinutes;
  const [durationHours, setDurationHours] = useState(
    initialDur != null && initialDur > 0
      ? String(Math.floor(initialDur / 60))
      : "",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialDur != null && initialDur > 0 ? String(initialDur % 60) : "",
  );
  const [saving, setSaving] = useState(false);

  const descLen = useMemo(() => plainTextLength(description), [description]);

  async function save() {
    setSaving(true);
    try {
      const h = Number.parseInt(durationHours.trim(), 10);
      const m = Number.parseInt(durationMinutes.trim(), 10);
      const hoursOk = durationHours.trim() === "" || !Number.isNaN(h);
      const minsOk = durationMinutes.trim() === "" || !Number.isNaN(m);
      if (!hoursOk || !minsOk) {
        toast.error(
          "Enter valid numbers for hours and minutes, or leave them blank.",
        );
        return;
      }
      let estimatedDurationMinutes: number | null = null;
      if (hoursOk && minsOk) {
        const hh = durationHours.trim() === "" ? 0 : Math.max(0, h);
        const mmRaw = durationMinutes.trim() === "" ? 0 : Math.max(0, m);
        const mm = Math.min(59, mmRaw);
        const total = hh * 60 + mm;
        estimatedDurationMinutes = total > 0 ? total : null;
      }

      const response = await fetch(`/api/tutor/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          description,
          language: language.trim() || null,
          level: level.trim() || null,
          category: category.trim() || null,
          subcategory: subcategory.trim() || null,
          primaryTopic: primaryTopic.trim() || null,
          thumbnailUrl: thumbnailUrl.trim() || null,
          promoVideoUrl: promoVideoUrl.trim() || null,
          estimatedDurationMinutes,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        toast.error(
          typeof body?.error === "string"
            ? body.error
            : "Could not save. Check required fields.",
        );
        return;
      }
      toast.success("Landing page saved.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 px-6 py-5">
      {readOnly ? (
        <p className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--muted)]">
          This course is pending review. Landing page fields are read-only.
        </p>
      ) : null}

      <div>
        <label htmlFor="cl-title" className="mb-1 block text-xs font-semibold">
          Course title
        </label>
        <input
          id="cl-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          disabled={readOnly}
          className="h-10 w-full border border-[var(--border)] px-3 text-sm disabled:bg-[var(--surface-muted)]"
        />
        <p className="mt-1 text-right text-[11px] text-[var(--muted)]">
          {title.length} / 120
        </p>
      </div>

      <div>
        <label htmlFor="cl-sub" className="mb-1 block text-xs font-semibold">
          Course subtitle
        </label>
        <input
          id="cl-sub"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          maxLength={200}
          disabled={readOnly}
          className="h-10 w-full border border-[var(--border)] px-3 text-sm disabled:bg-[var(--surface-muted)]"
        />
        <p className="mt-1 text-right text-[11px] text-[var(--muted)]">
          {subtitle.length} / 200
        </p>
      </div>

      <div>
        <span className="mb-1 block text-xs font-semibold">
          Course description
        </span>
        <RichTextArea
          value={description}
          onChange={setDescription}
          disabled={readOnly}
          placeholder="Describe what students will learn."
          minHeightClass="min-h-[200px]"
        />
        <p className="mt-1 text-[11px] text-[var(--muted)]">
          {descLen} characters of text (aim for a thorough description; 50+
          required to submit).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cl-lang" className="mb-1 block text-xs font-semibold">
            Language
          </label>
          <select
            id="cl-lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={readOnly}
            className="h-10 w-full border border-[var(--border)] bg-white px-2 text-sm disabled:bg-[var(--surface-muted)]"
          >
            <option value="English">English</option>
            <option value="English (US)">English (US)</option>
            <option value="English (UK)">English (UK)</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="cl-level"
            className="mb-1 block text-xs font-semibold"
          >
            Level
          </label>
          <select
            id="cl-level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            disabled={readOnly}
            className="h-10 w-full border border-[var(--border)] bg-white px-2 text-sm disabled:bg-[var(--surface-muted)]"
          >
            <option value="">— Select level —</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="All levels">All levels</option>
          </select>
        </div>
        <div>
          <label htmlFor="cl-cat" className="mb-1 block text-xs font-semibold">
            Category
          </label>
          <input
            id="cl-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={120}
            disabled={readOnly}
            placeholder="e.g. Pharmacy"
            className="h-10 w-full border border-[var(--border)] px-3 text-sm disabled:bg-[var(--surface-muted)]"
          />
        </div>
        <div>
          <label
            htmlFor="cl-subcat"
            className="mb-1 block text-xs font-semibold"
          >
            Subcategory
          </label>
          <input
            id="cl-subcat"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            maxLength={120}
            disabled={readOnly}
            placeholder="Optional"
            className="h-10 w-full border border-[var(--border)] px-3 text-sm disabled:bg-[var(--surface-muted)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cl-topic" className="mb-1 block text-xs font-semibold">
          Primary topic
        </label>
        <input
          id="cl-topic"
          value={primaryTopic}
          onChange={(e) => setPrimaryTopic(e.target.value)}
          maxLength={200}
          disabled={readOnly}
          placeholder="What is primarily taught?"
          className="h-10 w-full border border-[var(--border)] px-3 text-sm disabled:bg-[var(--surface-muted)]"
        />
      </div>

      <div>
        <span className="mb-1 block text-xs font-semibold">
          Estimated course duration (optional)
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={0}
            max={999}
            inputMode="numeric"
            placeholder="0"
            value={durationHours}
            onChange={(e) =>
              setDurationHours(e.target.value.replace(/\D/g, "").slice(0, 3))
            }
            disabled={readOnly}
            className="h-10 w-20 border border-[var(--border)] px-2 text-sm disabled:bg-[var(--surface-muted)]"
            aria-label="Hours"
          />
          <span className="text-sm text-[var(--muted)]">hr</span>
          <input
            type="number"
            min={0}
            max={59}
            inputMode="numeric"
            placeholder="0"
            value={durationMinutes}
            onChange={(e) =>
              setDurationMinutes(e.target.value.replace(/\D/g, "").slice(0, 2))
            }
            disabled={readOnly}
            className="h-10 w-16 border border-[var(--border)] px-2 text-sm disabled:bg-[var(--surface-muted)]"
            aria-label="Minutes"
          />
          <span className="text-sm text-[var(--muted)]">min</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
          Leave blank to auto-estimate from lesson video lengths plus about 30
          minutes if the course includes reading-style lessons.
        </p>
      </div>

      <FileUploader
        purpose="thumbnail"
        courseId={courseId}
        currentUrl={thumbnailUrl}
        onUploadComplete={setThumbnailUrl}
        disabled={readOnly}
      />

      <FileUploader
        purpose="promo-video"
        courseId={courseId}
        currentUrl={promoVideoUrl}
        onUploadComplete={setPromoVideoUrl}
        disabled={readOnly}
      />

      <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          disabled={readOnly || saving || title.trim().length < 3}
          onClick={() => void save()}
          className="rounded-sm bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
