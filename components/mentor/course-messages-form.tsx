"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useCourseStudio } from "@/components/mentor/course-studio-context";
import { RichTextArea } from "@/components/rich-text-area";

export type CourseMessagesInitial = {
  welcomeMessage: string | null;
  congratulatoryTitle: string | null;
  congratulatoryContentType: string | null;
  congratulatoryArticle: string | null;
  congratulatoryVideoUrl: string | null;
};

export function CourseMessagesForm({
  courseId,
  initial,
}: {
  courseId: string;
  initial: CourseMessagesInitial;
}) {
  const { readOnly } = useCourseStudio();
  const router = useRouter();
  const [welcomeMessage, setWelcomeMessage] = useState(
    initial.welcomeMessage ?? "",
  );
  const [congratulatoryTitle, setCongratulatoryTitle] = useState(
    initial.congratulatoryTitle ?? "",
  );
  const [contentType, setContentType] = useState<"ARTICLE" | "VIDEO">(
    initial.congratulatoryContentType === "VIDEO" ? "VIDEO" : "ARTICLE",
  );
  const [articleHtml, setArticleHtml] = useState(
    initial.congratulatoryArticle ?? "",
  );
  const [videoUrl, setVideoUrl] = useState(
    initial.congratulatoryVideoUrl ?? "",
  );
  const [saving, setSaving] = useState(false);

  const uploadVideo = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("purpose", "congrats-video");
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
          welcomeMessage: welcomeMessage.trim() || null,
          congratulatoryTitle: congratulatoryTitle.trim() || null,
          congratulatoryContentType: contentType,
          congratulatoryArticle: contentType === "ARTICLE" ? articleHtml : null,
          congratulatoryVideoUrl:
            contentType === "VIDEO" ? videoUrl.trim() || null : null,
        }),
      });
      if (!response.ok) {
        toast.error("Could not save messages.");
        return;
      }
      toast.success("Messages saved.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 px-6 py-5">
      {readOnly ? (
        <p className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--muted)]">
          This course is pending review. Course messages are read-only.
        </p>
      ) : null}

      <div>
        <span className="mb-2 block text-sm font-semibold">
          Welcome message
        </span>
        <p className="mb-2 text-xs text-[var(--muted)]">
          Sent when a student enrolls. Optional; supports basic formatting.
        </p>
        <RichTextArea
          value={welcomeMessage}
          onChange={setWelcomeMessage}
          disabled={readOnly}
          placeholder="Welcome students to your course."
        />
      </div>

      <div className="border-t border-[var(--border)] pt-6">
        <span className="mb-2 block text-sm font-semibold">
          Congratulations message
        </span>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Shown when a student completes the course. Provide a title, then
          choose article (rich text) or video content.
        </p>

        <label
          htmlFor="congrats-title"
          className="mb-1 block text-xs font-semibold"
        >
          Title
        </label>
        <input
          id="congrats-title"
          value={congratulatoryTitle}
          onChange={(e) => setCongratulatoryTitle(e.target.value)}
          maxLength={200}
          disabled={readOnly}
          placeholder="e.g. You did it!"
          className="mb-4 h-10 w-full max-w-lg border border-[var(--border)] px-3 text-sm disabled:bg-[var(--surface-muted)]"
        />

        <label
          htmlFor="congrats-type"
          className="mb-1 block text-xs font-semibold"
        >
          Content type
        </label>
        <select
          id="congrats-type"
          value={contentType}
          onChange={(e) =>
            setContentType(e.target.value as "ARTICLE" | "VIDEO")
          }
          disabled={readOnly}
          className="mb-4 h-10 max-w-xs border border-[var(--border)] bg-white px-2 text-sm disabled:bg-[var(--surface-muted)]"
        >
          <option value="ARTICLE">Article (rich text)</option>
          <option value="VIDEO">Video</option>
        </select>

        {contentType === "ARTICLE" ? (
          <RichTextArea
            value={articleHtml}
            onChange={setArticleHtml}
            disabled={readOnly}
            placeholder="Write your congratulations message."
            minHeightClass="min-h-[160px]"
          />
        ) : (
          <div className="rounded border border-[var(--border)] p-4">
            <p className="mb-2 text-xs text-[var(--muted)]">
              Upload a short congratulatory video.
            </p>
            {videoUrl ? (
              <p className="mb-2 break-all text-xs text-[var(--foreground)]">
                {videoUrl}
              </p>
            ) : null}
            <input
              type="file"
              accept="video/*"
              disabled={readOnly}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void (async () => {
                  try {
                    const { url } = await uploadVideo(file);
                    setVideoUrl(url);
                    toast.success("Congratulatory video uploaded.");
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Video upload failed.",
                    );
                  }
                })();
              }}
              className="text-sm"
            />
          </div>
        )}
      </div>


      <button
        type="button"
        disabled={readOnly || saving}
        onClick={() => void save()}
        className="rounded-sm bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
