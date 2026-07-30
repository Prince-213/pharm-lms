"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  putFileToStorage,
  requestDirectUploadPresign,
} from "@/lib/upload/direct-storage-upload";
import { cn } from "@/lib/utils";

type ProfileAvatarPickerProps = {
  label?: string;
  hint?: string;
  fullName: string;
  /** Current `User.avatarUrl` from the server (updates after refresh). */
  serverAvatarUrl: string | null;
  /** Signed or public URL for preview when stored value is `r2://…`. */
  resolvedPreviewSrc: string | null;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase();
}

function displayableHref(stored: string): string | null {
  const s = stored.trim();
  if (!s) return null;
  if (s.startsWith("https://") || s.startsWith("http://") || s.startsWith("/")) {
    return s;
  }
  return null;
}

function errorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "Upload failed.";
}

export function ProfileAvatarPicker({
  label = "Profile photo",
  hint,
  fullName,
  serverAvatarUrl,
  resolvedPreviewSrc,
  value,
  onChange,
  disabled = false,
}: ProfileAvatarPickerProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [transientPreview, setTransientPreview] = useState<string | null>(null);

  const revokeTransient = useCallback(() => {
    setTransientPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!transientPreview) return;
    const v = value.trim();
    const srv = (serverAvatarUrl ?? "").trim();
    if (srv && v && srv === v) {
      revokeTransient();
    }
  }, [serverAvatarUrl, value, transientPreview, revokeTransient]);

  useEffect(() => () => revokeTransient(), [revokeTransient]);

  const imgSrc =
    transientPreview ??
    displayableHref(value) ??
    resolvedPreviewSrc ??
    null;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    revokeTransient();
    setTransientPreview(blobUrl);

    setUploading(true);
    const tid = toast.loading("Uploading photo…");
    try {
      const presign = await requestDirectUploadPresign("/api/profile/avatar/presign", {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        contentLength: file.size,
      });

      if (!presign) {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          body: fd,
        });
        const body = (await res
          .json()
          .catch(() => null)) as { error?: string; url?: string } | null;
        if (!res.ok) {
          throw new Error(body?.error ?? "Upload failed.");
        }
        const url = body?.url;
        if (!url) throw new Error("Upload failed.");
        onChange(url);
        toast.success(
          "Photo uploaded. Save your profile to apply it to your account.",
          { id: tid },
        );
        return;
      }

      await putFileToStorage(
        presign.uploadUrl,
        file,
        presign.contentType || file.type || "application/octet-stream",
      );
      onChange(presign.url);
      toast.success("Photo uploaded. Save your profile to apply it to your account.", { id: tid });
    } catch (e) {
      revokeTransient();
      toast.error(errorMessage(e), { id: tid });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-semibold">
        {label}
      </Label>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-lg font-semibold text-muted-foreground",
          )}
        >
          {imgSrc ? (
            // biome-ignore lint/performance/noImgElement: OAuth, R2 signed URLs, or blob preview.
            <img src={imgSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden>{initialsFromName(fullName)}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void handleFile(file);
            }}
          />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] disabled:opacity-50"
          >
            {uploading ? "Uploading…" : value.trim() ? "Change photo" : "Choose photo"}
          </button>
          {value.trim() ? (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => {
                revokeTransient();
                onChange("");
              }}
              className="text-sm font-medium text-muted-foreground underline-offset-2 hover:text-[var(--foreground)] hover:underline disabled:opacity-50"
            >
              Remove photo
            </button>
          ) : null}
        </div>
      </div>
      {hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
