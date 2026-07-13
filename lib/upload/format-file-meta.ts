import { formatFileSize } from "@/lib/upload/format-file-size";

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word document",
  "application/vnd.ms-excel": "Excel spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Excel spreadsheet",
  "application/vnd.ms-powerpoint": "PowerPoint presentation",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PowerPoint presentation",
  "application/zip": "ZIP archive",
  "application/x-zip-compressed": "ZIP archive",
  "text/plain": "Text file",
  "video/mp4": "MP4 video",
  "video/webm": "WebM video",
  "video/quicktime": "MOV video",
  "video/x-matroska": "MKV video",
  "image/jpeg": "JPEG image",
  "image/png": "PNG image",
  "image/webp": "WebP image",
};

const EXTENSION_LABELS: Record<string, string> = {
  pdf: "PDF",
  doc: "Word document",
  docx: "Word document",
  xls: "Excel spreadsheet",
  xlsx: "Excel spreadsheet",
  ppt: "PowerPoint presentation",
  pptx: "PowerPoint presentation",
  zip: "ZIP archive",
  txt: "Text file",
  mp4: "MP4 video",
  webm: "WebM video",
  mov: "MOV video",
  mkv: "MKV video",
  jpg: "JPEG image",
  jpeg: "JPEG image",
  png: "PNG image",
  webp: "WebP image",
};

export function fileExtension(fileName?: string | null): string | null {
  if (!fileName?.trim()) return null;
  const base = fileName.trim().split(/[?#]/)[0] ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return null;
  return base.slice(dot + 1).toLowerCase();
}

export function fileNameFromStorageUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const raw = url.trim();
  const path = raw.startsWith("r2://")
    ? raw.slice("r2://".length)
    : raw.replace(/^https?:\/\/[^/]+/i, "");
  const segment = path.split("/").filter(Boolean).pop();
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function formatFileTypeLabel(
  mimeType?: string | null,
  fileName?: string | null,
): string {
  const mime = mimeType?.trim().toLowerCase();
  if (mime && MIME_LABELS[mime]) return MIME_LABELS[mime];
  if (mime?.startsWith("image/")) {
    const subtype = mime.split("/")[1]?.toUpperCase();
    return subtype ? `${subtype} image` : "Image";
  }
  if (mime?.startsWith("video/")) {
    const subtype = mime.split("/")[1]?.toUpperCase();
    return subtype ? `${subtype} video` : "Video";
  }
  if (mime?.startsWith("text/")) {
    const subtype = mime.split("/")[1]?.toUpperCase();
    return subtype ? `${subtype} file` : "Text file";
  }

  const ext = fileExtension(fileName);
  if (ext && EXTENSION_LABELS[ext]) return EXTENSION_LABELS[ext];
  if (ext) return `${ext.toUpperCase()} file`;

  return "File";
}

export function formatFileListMeta({
  sizeBytes,
  mimeType,
  fileName,
}: {
  sizeBytes?: number | null;
  mimeType?: string | null;
  fileName?: string | null;
}): string {
  const parts: string[] = [];
  if (sizeBytes != null && sizeBytes > 0) {
    parts.push(formatFileSize(sizeBytes));
  }
  const typeLabel = formatFileTypeLabel(mimeType, fileName);
  if (typeLabel) parts.push(typeLabel);
  return parts.length > 0 ? parts.join(" · ") : "Ready to use";
}

export function resolveUploadedFileDisplay({
  fileName,
  storedFileName,
  previewName,
  storageUrl,
  mimeType,
}: {
  fileName?: string | null;
  storedFileName?: string | null;
  previewName?: string | null;
  storageUrl?: string | null;
  mimeType?: string | null;
}): string {
  const candidates = [
    fileName?.trim(),
    storedFileName?.trim(),
    previewName?.trim(),
    fileNameFromStorageUrl(storageUrl),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (!looksLikeOpaqueStorageName(candidate)) return candidate;
  }

  const urlName = fileNameFromStorageUrl(storageUrl);
  const typeLabel = formatFileTypeLabel(mimeType, urlName);
  const ext = fileExtension(urlName);
  if (ext && !typeLabel.toLowerCase().includes(ext)) {
    return `${typeLabel}.${ext}`;
  }
  return typeLabel || candidates[0] || "Uploaded file";
}

function looksLikeOpaqueStorageName(name: string): boolean {
  const base = name.split(/[?#]/)[0] ?? name;
  const withoutExt = base.includes(".")
    ? base.slice(0, base.lastIndexOf("."))
    : base;
  return /^[0-9a-f-]{20,}$/i.test(withoutExt);
}
