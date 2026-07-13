"use client";

import dynamic from "next/dynamic";
import { CurriculumEditorSkeleton } from "@/components/mentor/curriculum-editor-ui";

const CurriculumEditorV2 = dynamic(
  () =>
    import("@/components/mentor/curriculum-editor-v2").then((m) => ({
      default: m.CurriculumEditorV2,
    })),
  {
    loading: () => <CurriculumEditorSkeleton />,
    ssr: false,
  },
);

export default function CurriculumEditorV2Dynamic({
  courseId,
}: {
  courseId: string;
}) {
  return <CurriculumEditorV2 courseId={courseId} />;
}
