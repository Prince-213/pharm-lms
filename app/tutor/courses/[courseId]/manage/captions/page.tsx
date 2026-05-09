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
    <section className="mx-auto max-w-[900px] border border-[#d1d7dc] bg-white">
      <div className="border-b border-[#d1d7dc] px-6 py-4">
        <h1 className="text-2xl font-bold text-[#1c1d1f]">
          Captions (optional)
        </h1>
      </div>
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-[#6a6f73]">
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
