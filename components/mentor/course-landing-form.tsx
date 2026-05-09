"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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
  const [saving, setSaving] = useState(false);

  const descLen = useMemo(() => plainTextLength(description), [description]);

  const uploadAsset = useCallback(
    async (file: File, purpose: string) => {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("purpose", purpose);
      const response = await fetch(`/api/tutor/courses/${courseId}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Upload failed.");
      }
      return (await response.json()) as { url: string };
    },
    [courseId],
  );

  async function save() {
    setSaving(true);
    try {
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
        <p className="rounded border border-[#d1d7dc] bg-[#f6f7f9] p-3 text-sm text-[#6a6f73]">
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
          className="h-10 w-full border border-[#d1d7dc] px-3 text-sm disabled:bg-[#f6f7f9]"
        />
        <p className="mt-1 text-right text-[11px] text-[#6a6f73]">
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
          className="h-10 w-full border border-[#d1d7dc] px-3 text-sm disabled:bg-[#f6f7f9]"
        />
        <p className="mt-1 text-right text-[11px] text-[#6a6f73]">
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
        <p className="mt-1 text-[11px] text-[#6a6f73]">
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
            className="h-10 w-full border border-[#d1d7dc] bg-white px-2 text-sm disabled:bg-[#f6f7f9]"
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
            className="h-10 w-full border border-[#d1d7dc] bg-white px-2 text-sm disabled:bg-[#f6f7f9]"
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
            className="h-10 w-full border border-[#d1d7dc] px-3 text-sm disabled:bg-[#f6f7f9]"
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
            className="h-10 w-full border border-[#d1d7dc] px-3 text-sm disabled:bg-[#f6f7f9]"
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
          className="h-10 w-full border border-[#d1d7dc] px-3 text-sm disabled:bg-[#f6f7f9]"
        />
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



      <div className="flex justify-end gap-2 border-t border-[#d1d7dc] pt-4">
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
