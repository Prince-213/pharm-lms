"use client";

import { Upload, X, FileVideo, FileText, Image as ImageIcon, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useState, useRef } from "react";
import { toast } from "sonner";

type UploadPurpose =
  | "thumbnail"
  | "promo-video"
  | "lesson-video"
  | "resource-file"
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
  onUploadComplete: (url: string) => void;
  disabled?: boolean;
  currentUrl?: string | null;
  label?: string;
  description?: string;
  showPreview?: boolean;
  onRemove?: () => void;
};

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
  showPreview = true,
  onRemove,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      case "congrats-video":
        return "Video shown when students complete the course.";
      default:
        return `Max size: ${maxSizeMb}MB`;
    }
  };

  const getFileIcon = () => {
    switch (purpose) {
      case "thumbnail":
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
      case "promo-video":
      case "lesson-video":
      case "congrats-video":
        return <FileVideo className="h-8 w-8 text-purple-500" />;
      case "resource-file":
        return <FileText className="h-8 w-8 text-emerald-500" />;
      default:
        return <Upload className="h-8 w-8 text-gray-400" />;
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      return `File is too large. Maximum size is ${maxSizeMb}MB.`;
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
      if (isPDFType && file.type !== "application/pdf" && !mimeTypes.includes(file.type)) {
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
      setUploadProgress(0);

      // Create preview
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

        const response = await fetch(`/api/mentor/courses/${courseId}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Upload failed");
        }

        const data = (await response.json()) as { url: string };
        onUploadComplete(data.url);
        setIsReplacing(false);
        toast.success(`${getLabel()} uploaded successfully`);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
        setFilePreview(null);
      } finally {
        setIsUploading(false);
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
      // Reset input
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
  if (currentUrl && !isReplacing && !isUploading) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#1c1d1f]">{getLabel()}</label>
        <div className="flex items-center justify-between rounded-lg border border-[#d1d7dc] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-md bg-purple-50 p-2">
              {getFileIcon()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#1c1d1f]">
                {currentUrl.split("/").pop()}
              </p>
              <p className="text-xs text-[#6a6f73]">Successfully uploaded</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsReplacing(true)}
              disabled={disabled}
              className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:opacity-80"
            >
              <RefreshCw className="h-3 w-3" />
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:opacity-80"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#1c1d1f]">
          {isReplacing ? `Replace ${getLabel().toLowerCase()}` : getLabel()}
        </label>
        {isReplacing && (
           <button
           type="button"
           onClick={() => setIsReplacing(false)}
           className="text-xs font-semibold text-[#6a6f73] hover:text-[#1c1d1f]"
         >
           Cancel
         </button>
        )}
      </div>

      <div
        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[#d1d7dc] hover:border-[#a3a9b0]"
        } ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={getAcceptString()}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <div className="flex justify-center">{getFileIcon()}</div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#1c1d1f]">{filePreview?.name}</p>
              <div className="h-2 w-full rounded-full bg-[#d1d7dc]">
                <div
                  className="h-2 rounded-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-[#6a6f73]">{uploadProgress}% uploaded</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">{getFileIcon()}</div>
            <div>
              <p className="text-sm font-medium text-[#1c1d1f]">
                {isReplacing ? "Select new file to replace" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-[#6a6f73] mt-1">{getDescription()}</p>
            </div>
          </div>
        )}
      </div>

      {showPreview && filePreview && !isUploading && (
        <div className="rounded-lg border border-[#d1d7dc] bg-[#f6f7f9] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon()}
              <div>
                <p className="text-xs font-medium text-[#1c1d1f]">{filePreview.name}</p>
                <p className="text-[11px] text-[#6a6f73]">
                  {(filePreview.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearPreview}
              className="rounded p-1 text-[#6a6f73] hover:bg-[#d1d7dc]"
              aria-label="Remove preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {filePreview.url && purpose === "thumbnail" && (
            <img
              src={filePreview.url}
              alt="Preview"
              className="mt-2 max-h-32 rounded object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
}