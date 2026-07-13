"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import { useCourseStudio } from "@/components/mentor/course-studio-context";
import { CourseCategoryInput } from "@/components/mentor/course-category-input";
import { RichTextArea } from "@/components/rich-text-area";
import { FileUploader } from "@/components/upload/file-uploader";
import { cn } from "@/lib/utils";

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
  const { readOnly, registerStepHandlers } = useCourseStudio();
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
  const [mediaUploading, setMediaUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const descLen = useMemo(() => plainTextLength(description), [description]);

  function inputClass(field: string) {
    return cn(
      "h-10 w-full border px-3 text-sm disabled:bg-[var(--surface-muted)]",
      fieldErrors[field]
        ? "border-destructive focus:border-destructive"
        : "border-[var(--border)]",
    );
  }

  function validateForNext(): boolean {
    const errors: Record<string, string> = {};
    if (title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters.";
    }
    if (plainTextLength(description) < 50) {
      errors.description = "Description must be at least 50 characters of text.";
    }
    if (!language.trim()) {
      errors.language = "Language is required.";
    }
    if (!level.trim()) {
      errors.level = "Level is required.";
    }
    if (!primaryTopic.trim()) {
      errors.primaryTopic = "Primary topic is required.";
    }
    if (!thumbnailUrl.trim()) {
      errors.thumbnail = "Upload a course cover image.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      const idMap: Record<string, string> = {
        title: "cl-title",
        description: "cl-description",
        language: "cl-lang",
        level: "cl-level",
        primaryTopic: "cl-topic",
        thumbnail: "cl-thumbnail",
      };
      const el = document.getElementById(idMap[firstKey] ?? firstKey);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
      toast.error("Complete the required landing page fields before continuing.");
      return false;
    }
    return true;
  }

  useEffect(() => {
    registerStepHandlers({
      navigationLocked: saving || mediaUploading,
      onNext: () => validateForNext(),
    });
    return () => registerStepHandlers(null);
  }, [
    registerStepHandlers,
    title,
    description,
    language,
    level,
    primaryTopic,
    thumbnailUrl,
    saving,
    mediaUploading,
  ]);

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
      refreshPortalAfterMutation(router);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 px-6 py-5">
      {readOnly ? (
        <p className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-muted-foreground">
          This course is pending review. Landing page fields are read-only.
        </p>
      ) : null}

      <div>
        <label htmlFor="cl-title" className="mb-1 block text-xs font-bold text-foreground">
          Course title
        </label>
        <input
          id="cl-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (fieldErrors.title) {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.title;
                return next;
              });
            }
          }}
          maxLength={120}
          disabled={readOnly}
          className={inputClass("title")}
        />
        {fieldErrors.title ? (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
        ) : null}
        <p className="mt-1 text-right text-[11px] text-muted-foreground">
          {title.length} / 120
        </p>
      </div>

      <div>
        <label htmlFor="cl-sub" className="mb-1 block text-xs font-bold text-foreground">
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
        <p className="mt-1 text-right text-[11px] text-muted-foreground">
          {subtitle.length} / 200
        </p>
      </div>

      <div id="cl-description">
        <span className="mb-1 block text-xs font-bold text-foreground">
          Course description
        </span>
        <RichTextArea
          value={description}
          onChange={(value) => {
            setDescription(value);
            if (fieldErrors.description) {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.description;
                return next;
              });
            }
          }}
          disabled={readOnly}
          placeholder="Describe what students will learn."
          minHeightClass="min-h-[200px]"
        />
        {fieldErrors.description ? (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.description}</p>
        ) : null}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {descLen} characters of text (aim for a thorough description; 50+
          required to submit).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cl-lang" className="mb-1 block text-xs font-bold text-foreground">
            Language
          </label>
          <select
            id="cl-lang"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              if (fieldErrors.language) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.language;
                  return next;
                });
              }
            }}
            disabled={readOnly}
            className={cn(
              "h-10 w-full border bg-white px-2 text-sm disabled:bg-[var(--surface-muted)]",
              fieldErrors.language ? "border-destructive" : "border-[var(--border)]",
            )}
          >
            <option value="English">English</option>
            <option value="English (US)">English (US)</option>
            <option value="English (UK)">English (UK)</option>
          </select>
          {fieldErrors.language ? (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.language}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="cl-level"
            className="mb-1 block text-xs font-bold text-foreground"
          >
            Level
          </label>
          <select
            id="cl-level"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              if (fieldErrors.level) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.level;
                  return next;
                });
              }
            }}
            disabled={readOnly}
            className={cn(
              "h-10 w-full border bg-white px-2 text-sm disabled:bg-[var(--surface-muted)]",
              fieldErrors.level ? "border-destructive" : "border-[var(--border)]",
            )}
          >
            <option value="">— Select level —</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="All levels">All levels</option>
          </select>
          {fieldErrors.level ? (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.level}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="cl-cat" className="mb-1 block text-xs font-bold text-foreground">
            Category
          </label>
          <CourseCategoryInput
            id="cl-cat"
            value={category}
            onChange={setCategory}
            disabled={readOnly}
            placeholder="e.g. Business, Design, Pharmacy…"
            className="h-10 w-full border border-[var(--border)] px-3 text-sm disabled:bg-[var(--surface-muted)]"
          />
        </div>
        <div>
          <label
            htmlFor="cl-subcat"
            className="mb-1 block text-xs font-bold text-foreground"
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
        <label htmlFor="cl-topic" className="mb-1 block text-xs font-bold text-foreground">
          Primary topic
        </label>
        <input
          id="cl-topic"
          value={primaryTopic}
          onChange={(e) => {
            setPrimaryTopic(e.target.value);
            if (fieldErrors.primaryTopic) {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.primaryTopic;
                return next;
              });
            }
          }}
          maxLength={200}
          disabled={readOnly}
          placeholder="What is primarily taught?"
          className={inputClass("primaryTopic")}
        />
        {fieldErrors.primaryTopic ? (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.primaryTopic}</p>
        ) : null}
      </div>

      <div>
        <span className="mb-1 block text-xs font-bold text-foreground">
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
          <span className="text-sm text-muted-foreground">hr</span>
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
          <span className="text-sm text-muted-foreground">min</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Leave blank to auto-estimate from lesson video lengths plus about 30
          minutes if the course includes reading-style lessons.
        </p>
      </div>

      <div id="cl-thumbnail">
      <FileUploader
        purpose="thumbnail"
        courseId={courseId}
        currentUrl={thumbnailUrl}
        onUploadComplete={(url) => {
          setThumbnailUrl(url);
          if (fieldErrors.thumbnail) {
            setFieldErrors((prev) => {
              const next = { ...prev };
              delete next.thumbnail;
              return next;
            });
          }
        }}
        onUploadingChange={setMediaUploading}
        disabled={readOnly}
      />
      {fieldErrors.thumbnail ? (
        <p className="mt-1 text-xs text-destructive">{fieldErrors.thumbnail}</p>
      ) : null}
      </div>

      <FileUploader
        purpose="promo-video"
        courseId={courseId}
        currentUrl={promoVideoUrl}
        onUploadComplete={setPromoVideoUrl}
        onUploadingChange={setMediaUploading}
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
