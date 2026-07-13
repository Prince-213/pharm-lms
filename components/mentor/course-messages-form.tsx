"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import { useCourseStudio } from "@/components/mentor/course-studio-context";
import { RichTextArea } from "@/components/rich-text-area";
import { FileUploader } from "@/components/upload/file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cnUdemyCard, cnUdemyInput, udemyBorderClass } from "@/lib/ui/udemy-surface";
import { cn } from "@/lib/utils";

export type CourseMessagesInitial = {
  welcomeMessage: string | null;
  congratulatoryTitle: string | null;
  congratulatoryContentType: string | null;
  congratulatoryArticle: string | null;
  congratulatoryVideoUrl: string | null;
};

function plainTextLength(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
}

export function CourseMessagesForm({
  courseId,
  initial,
}: {
  courseId: string;
  initial: CourseMessagesInitial;
}) {
  const { readOnly, registerStepHandlers } = useCourseStudio();
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
  const [mediaUploading, setMediaUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateForNext(): boolean {
    const errors: Record<string, string> = {};
    if (!congratulatoryTitle.trim()) {
      errors.congratulatoryTitle = "Congratulations title is required.";
    }
    if (contentType === "ARTICLE") {
      if (plainTextLength(articleHtml) < 20) {
        errors.article = "Write at least 20 characters of congratulations text.";
      }
    } else if (!videoUrl.trim()) {
      errors.video = "Upload a congratulatory video.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      const idMap: Record<string, string> = {
        congratulatoryTitle: "congrats-title",
        article: "congrats-article",
        video: "congrats-video",
      };
      const el = document.getElementById(idMap[firstKey] ?? firstKey);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
      toast.error("Complete the required message fields before continuing.");
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
    congratulatoryTitle,
    contentType,
    articleHtml,
    videoUrl,
    saving,
    mediaUploading,
  ]);

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
      refreshPortalAfterMutation(router);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6">
      {readOnly ? (
        <Alert className={cn(udemyBorderClass, "bg-[#f7f9fa]")}>
          <AlertDescription>
            This course is pending review. Course messages are read-only.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className={cnUdemyCard()}>
        <CardHeader className={cn("border-b", udemyBorderClass)}>
          <CardTitle className="text-base">Welcome message</CardTitle>
          <CardDescription>
            Sent when a student enrolls. Optional; supports basic formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <RichTextArea
            value={welcomeMessage}
            onChange={setWelcomeMessage}
            disabled={readOnly}
            placeholder="Welcome students to your course."
          />
        </CardContent>
      </Card>

      <Card className={cnUdemyCard()}>
        <CardHeader className={cn("border-b", udemyBorderClass)}>
          <CardTitle className="text-base">Congratulations message</CardTitle>
          <CardDescription>
            Shown when a student completes the course. Provide a title, then
            choose article (rich text) or video content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="congrats-title">Title</Label>
            <Input
              id="congrats-title"
              value={congratulatoryTitle}
              onChange={(e) => {
                setCongratulatoryTitle(e.target.value);
                if (fieldErrors.congratulatoryTitle) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.congratulatoryTitle;
                    return next;
                  });
                }
              }}
              maxLength={200}
              disabled={readOnly}
              placeholder="e.g. You did it!"
              className={cn(
                "max-w-lg",
                cnUdemyInput(),
                fieldErrors.congratulatoryTitle && "border-destructive",
              )}
            />
            {fieldErrors.congratulatoryTitle ? (
              <p className="text-xs text-destructive">
                {fieldErrors.congratulatoryTitle}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="congrats-type">Content type</Label>
            <Select
              value={contentType}
              onValueChange={(value) => {
                setContentType(value as "ARTICLE" | "VIDEO");
                setFieldErrors({});
              }}
              disabled={readOnly}
            >
              <SelectTrigger
                id="congrats-type"
                className={cn("max-w-xs w-full", cnUdemyInput())}
              >
                <SelectValue placeholder="Choose content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARTICLE">Article (rich text)</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contentType === "ARTICLE" ? (
            <div id="congrats-article" className="space-y-1.5">
              <Label>Article body</Label>
              <RichTextArea
                value={articleHtml}
                onChange={(value) => {
                  setArticleHtml(value);
                  if (fieldErrors.article) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.article;
                      return next;
                    });
                  }
                }}
                disabled={readOnly}
                placeholder="Write your congratulations message."
                minHeightClass="min-h-[160px]"
              />
              {fieldErrors.article ? (
                <p className="text-xs text-destructive">{fieldErrors.article}</p>
              ) : null}
            </div>
          ) : (
            <div id="congrats-video" className="space-y-1.5">
              <Label>Congratulatory video</Label>
              <FileUploader
                purpose="congrats-video"
                courseId={courseId}
                currentUrl={videoUrl || null}
                onUploadComplete={(url) => {
                  setVideoUrl(url);
                  if (fieldErrors.video) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.video;
                      return next;
                    });
                  }
                }}
                onUploadingChange={setMediaUploading}
                disabled={readOnly}
              />
              {fieldErrors.video ? (
                <p className="text-xs text-destructive">{fieldErrors.video}</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end border-t border-[#d1d7dc] pt-4">
        <LoadingButton
          type="button"
          disabled={readOnly}
          loading={saving}
          loadingLabel="Saving…"
          onClick={() => void save()}
        >
          Save messages
        </LoadingButton>
      </div>
    </div>
  );
}
