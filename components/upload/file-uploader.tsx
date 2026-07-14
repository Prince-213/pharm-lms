"use client";

import {
  Upload,
  X,
  FileVideo,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  uploadCourseFileWithProgress,
  type CourseFileUploadProgress,
} from "@/lib/upload/course-file-upload";
import { formatFileSize } from "@/lib/upload/format-file-size";
import {
  formatFileListMeta,
  resolveUploadedFileDisplay,
} from "@/lib/upload/format-file-meta";
import {
  DOCUMENT_FILE_ACCEPT,
  DOCUMENT_FILE_DESCRIPTION,
  isDocumentFile,
} from "@/lib/upload/document-file-types";
import { udemyBorderClass } from "@/lib/ui/udemy-surface";
import { cn } from "@/lib/utils";

type UploadPurpose =
  | "thumbnail"
  | "promo-video"
  | "lesson-video"
  | "resource-file"
  | "curriculum-resource"
  | "congrats-video";

type FilePreview = {
  name: string;
  size: number;
  type: string;
  url?: string;
};

type FileUploaderProps = {
  purpose: UploadPurpose;
  courseId: string;
  accept?: string;
  maxSizeMb?: number;
  onUploadComplete: (
    url: string,
    fileMeta?: { name: string; sizeBytes: number; mimeType?: string },
  ) => void;
  disabled?: boolean;
  currentUrl?: string | null;
  /** Friendly label when file is already uploaded (e.g. original filename). */
  fileName?: string | null;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  label?: string;
  description?: string;
  /** Hide the uploader heading (use when a parent field or item row already labels the control). */
  hideLabel?: boolean;
  showPreview?: boolean;
  compact?: boolean;
  onRemove?: () => void;
  onUploadingChange?: (uploading: boolean) => void;
};

function progressStatusLabel(update: CourseFileUploadProgress): string {
  if (update.phase === "processing") {
    return "Saving file on server…";
  }
  if (update.phase === "complete") {
    return "Upload complete";
  }
  if (update.total > 0) {
    return `${formatFileSize(update.loaded)} of ${formatFileSize(update.total)}`;
  }
  return "Starting upload…";
}

export function FileUploader({
  purpose,
  courseId,
  accept,
  maxSizeMb = 500,
  onUploadComplete,
  disabled = false,
  currentUrl,
  label,
  description,
  hideLabel = false,
  showPreview = true,
  compact = false,
  fileName,
  fileSizeBytes,
  mimeType,
  onRemove,
  onUploadingChange,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [uploadProgress, setUploadProgress] =
    useState<CourseFileUploadProgress | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [storedSizeBytes, setStoredSizeBytes] = useState<number | null>(
    fileSizeBytes ?? null,
  );
  const [storedFileName, setStoredFileName] = useState<string | null>(
    fileName?.trim() || null,
  );
  const [storedMimeType, setStoredMimeType] = useState<string | null>(
    mimeType?.trim() || null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStoredSizeBytes(fileSizeBytes ?? null);
  }, [fileSizeBytes]);

  useEffect(() => {
    setStoredFileName(fileName?.trim() || null);
  }, [fileName]);

  useEffect(() => {
    setStoredMimeType(mimeType?.trim() || null);
  }, [mimeType]);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const getAcceptString = () => {
    if (accept) return accept;
    switch (purpose) {
      case "thumbnail":
        return "image/jpeg,image/png,image/webp";
      case "promo-video":
      case "lesson-video":
      case "congrats-video":
        return "video/*";
      case "resource-file":
        return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,image/*";
      case "curriculum-resource":
        return DOCUMENT_FILE_ACCEPT;
      default:
        return "*/*";
    }
  };

  const getLabel = () => {
    if (label) return label;
    switch (purpose) {
      case "thumbnail":
        return "Course image";
      case "promo-video":
        return "Promotional video";
      case "lesson-video":
        return "Lesson video";
      case "resource-file":
        return "Resource file";
      case "curriculum-resource":
        return "Document file";
      case "congrats-video":
        return "Congratulatory video";
      default:
        return "File";
    }
  };

  const getDescription = () => {
    if (description) return description;
    switch (purpose) {
      case "thumbnail":
        return "JPG, PNG, or WebP. Recommended: 750×422 pixels.";
      case "promo-video":
        return "MP4, WebM, or MOV. This will appear on your course landing page.";
      case "lesson-video":
        return "Upload your lecture video file.";
      case "resource-file":
        return "PDF, DOC, PPT, images, or other study materials.";
      case "curriculum-resource":
        return DOCUMENT_FILE_DESCRIPTION;
      case "congrats-video":
        return "Video shown when students complete the course.";
      default:
        return `Max size: ${maxSizeMb}MB`;
    }
  };

  const getFileIcon = (className = "h-4 w-4") => {
    switch (purpose) {
      case "thumbnail":
        return <ImageIcon className={cn(className, "text-blue-500")} />;
      case "promo-video":
      case "lesson-video":
      case "congrats-video":
        return <FileVideo className={cn(className, "text-purple-500")} />;
      case "resource-file":
      case "curriculum-resource":
        return <FileText className={cn(className, "text-primary")} />;
      default:
        return <Upload className={cn(className, "text-muted-foreground")} />;
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      return `File is too large. Maximum size is ${maxSizeMb}MB.`;
    }
    if (purpose === "curriculum-resource" && !isDocumentFile(file)) {
      return "Please upload a document file (PDF, Word, Excel, PowerPoint, or TXT).";
    }
    const acceptStr = getAcceptString();
    if (acceptStr !== "*/*") {
      const mimeTypes = acceptStr.split(",").map((s) => s.trim());
      const isImageType = mimeTypes.some((m) => m.startsWith("image/"));
      const isVideoType = mimeTypes.some((m) => m.startsWith("video/"));
      const isPDFType = mimeTypes.includes("application/pdf");

      if (isImageType && !file.type.startsWith("image/")) {
        return "Please select a valid image file (JPG, PNG, WebP).";
      }
      if (isVideoType && !file.type.startsWith("video/")) {
        return "Please select a valid video file.";
      }
      if (
        isPDFType &&
        file.type !== "application/pdf" &&
        !mimeTypes.includes(file.type)
      ) {
        return "Please select a valid file type.";
      }
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      setIsUploading(true);
      setUploadProgress({
        percent: 0,
        loaded: 0,
        total: file.size,
        phase: "uploading",
      });

      const preview: FilePreview = {
        name: file.name,
        size: file.size,
        type: file.type,
      };

      if (file.type.startsWith("image/")) {
        preview.url = URL.createObjectURL(file);
      }
      setFilePreview(preview);

      try {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("purpose", purpose);

        const data = await uploadCourseFileWithProgress(
          courseId,
          formData,
          (update) => {
            setUploadProgress(update);
          },
        );

        onUploadComplete(data.url, {
          name: file.name,
          sizeBytes: file.size,
          mimeType: file.type || undefined,
        });
        setStoredSizeBytes(file.size);
        setStoredFileName(file.name);
        setStoredMimeType(file.type || null);
        setIsReplacing(false);
        toast.success(`${getLabel()} uploaded successfully`);
      } catch (err) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : err instanceof Error
              ? err.message
              : "Upload failed";
        toast.error(message);
        setFilePreview(null);
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [courseId, onUploadComplete, purpose, maxSizeMb],
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (disabled || isUploading) return;
      void uploadFile(file);
    },
    [disabled, isUploading, uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [disabled, isUploading, handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      e.target.value = "";
    },
    [handleFileSelect],
  );

  const clearPreview = () => {
    if (filePreview?.url) {
      URL.revokeObjectURL(filePreview.url);
    }
    setFilePreview(null);
  };

  const displayName = resolveUploadedFileDisplay({
    fileName,
    storedFileName,
    previewName: filePreview?.name,
    storageUrl: currentUrl,
    mimeType: storedMimeType ?? filePreview?.type ?? mimeType,
  });

  const metaLabel = formatFileListMeta({
    sizeBytes: storedSizeBytes ?? filePreview?.size ?? null,
    mimeType: storedMimeType ?? filePreview?.type ?? mimeType ?? null,
    fileName: displayName,
  });

  if (currentUrl && !isReplacing && !isUploading) {
    return (
      <div className={hideLabel ? undefined : "space-y-2"}>
        {hideLabel ? null : (
          <label className="text-xs font-bold text-foreground">{getLabel()}</label>
        )}
        <div
          className={cn(
            "relative flex h-14 min-h-14 items-center gap-3 overflow-hidden border bg-card px-4 py-2 sm:px-5 hover:bg-muted/50",
            udemyBorderClass,
            compact ? "shadow-none" : "shadow-sm",
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-muted">
            {getFileIcon()}
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground" title={displayName}>
              {displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground" title={metaLabel}>
              {metaLabel}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReplacing(true)}
              disabled={disabled}
              className="h-8 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Replace
            </Button>
            {onRemove ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
                disabled={disabled}
                className="h-8 border-destructive/30 bg-destructive/5 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (isUploading && filePreview) {
    const percent = uploadProgress?.percent ?? 0;
    const statusLabel = uploadProgress
      ? progressStatusLabel(uploadProgress)
      : "Starting upload…";

    return (
      <div className={hideLabel ? undefined : "space-y-2"}>
        {hideLabel ? null : (
          <label className="text-xs font-bold text-foreground">{getLabel()}</label>
        )}
        <div
          className={cn(
            "flex h-14 min-h-14 items-center gap-3 overflow-hidden border bg-card px-4 py-4 sm:px-5",
            udemyBorderClass,
          )}
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-muted">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {filePreview.name}
                </p>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-primary">
                  {percent}%
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {formatFileListMeta({
                  sizeBytes: filePreview.size,
                  mimeType: filePreview.type,
                  fileName: filePreview.name,
                })}
              </p>
              <Progress value={percent} disableTransition className="h-2" />
              <p className="text-xs text-muted-foreground">{statusLabel}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={hideLabel ? undefined : "space-y-2"}>
      {hideLabel ? (
        isReplacing ? (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsReplacing(false)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : null
      ) : (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground">
            {isReplacing ? `Replace ${getLabel().toLowerCase()}` : getLabel()}
          </label>
          {isReplacing ? (
            <button
              type="button"
              onClick={() => setIsReplacing(false)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          ) : null}
        </div>
      )}

      <div
        className={cn(
          "relative flex min-h-14 items-center justify-center border-2 border-dashed text-center transition-colors",
          udemyBorderClass,
          "bg-muted/40",
          compact ? "rounded-lg p-4" : "rounded-lg p-6",
          isDragging ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={getAcceptString()}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="space-y-3">
          <div className="flex justify-center">{getFileIcon("h-8 w-8")}</div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isReplacing
                ? "Select new file to replace"
                : "Click to upload or drag and drop"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getDescription()}
            </p>
          </div>
        </div>
      </div>

      {showPreview && filePreview && !isUploading ? (
        <div className={cn("rounded-lg border bg-muted/40 p-3", udemyBorderClass)}>
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2">
              {getFileIcon()}
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {filePreview.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatFileListMeta({
                    sizeBytes: filePreview.size,
                    mimeType: filePreview.type,
                    fileName: filePreview.name,
                  })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearPreview}
              className="rounded p-1 text-muted-foreground hover:bg-background"
              aria-label="Remove preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {filePreview.url && purpose === "thumbnail" ? (
            <img
              src={filePreview.url}
              alt="Preview"
              className="mt-2 max-h-32 rounded object-cover"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
