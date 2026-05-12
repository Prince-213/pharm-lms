"use client";

import { use, useState } from "react";
import { FileUploader } from "@/components/upload/file-uploader";

export default function MentorCourseFilmEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-[900px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Film & edit</h1>
      </div>
      <div className="space-y-5 px-6 py-5">
        <h2 className="text-xl font-semibold">
          You&apos;re ready to share your knowledge.
        </h2>
        <p className="text-sm text-[var(--muted)]">
          This is your moment. If you&apos;ve structured your course and used
          our setup, you&apos;re prepared.
        </p>
        <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <h3 className="mb-2 text-lg font-semibold">Tips</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
            <li>Take breaks and review frequently.</li>
            <li>Build rapport with your learners.</li>
            <li>Keep your recording environment controlled.</li>
          </ul>
        </div>

        <div className="rounded border border-[var(--border)] p-4">
          <FileUploader
            purpose="lesson-video"
            courseId={courseId}
            currentUrl={videoUrl}
            onUploadComplete={setVideoUrl}
            label="Lecture recording"
            description="MP4, WebM, or MOV video file. High quality recommended."
          />
        </div>
      </div>
    </section>
  );
}
