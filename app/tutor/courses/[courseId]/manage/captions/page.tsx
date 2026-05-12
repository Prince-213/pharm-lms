"use client";

import { use, useState } from "react";
import { FileUploader } from "@/components/upload/file-uploader";

export default function MentorCourseCaptionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [captionUrl, setCaptionUrl] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-[900px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Captions (optional)
        </h1>
      </div>
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-[var(--muted)]">
          Upload captions for better accessibility and learning outcomes.
        </p>
        <FileUploader
          purpose="resource-file"
          courseId={courseId}
          currentUrl={captionUrl}
          onUploadComplete={setCaptionUrl}
          label="Caption file"
          description="SRT or VTT caption files for video accessibility"
        />
      </div>
    </section>
  );
}
