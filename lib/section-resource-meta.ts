import type { SectionResource } from "@/components/mentor/curriculum-editor-v2";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionFromUrl(url: string): string | null {
  const path = url.split("?")[0];
  const seg = path.split("/").pop() || "";
  const i = seg.lastIndexOf(".");
  if (i > 0 && i < seg.length - 1) {
    return seg.slice(i + 1).toUpperCase();
  }
  return null;
}

export function deriveFilenameFromResourceUrl(url: string): string {
  const stripped = url.replace(/^r2:\/\//, "");
  const path = stripped.split("?")[0];
  const seg = path.split("/").pop() || "";
  try {
    const decoded = decodeURIComponent(seg);
    return decoded || "download";
  } catch {
    return seg || "download";
  }
}

/** Suggested `download` attribute value for anchors. */
export function resourceDownloadFilename(res: SectionResource): string {
  if (res.originalFileName?.trim()) return res.originalFileName.trim();
  return deriveFilenameFromResourceUrl(res.url);
}

/**
 * One muted line: type · size · filename (e.g. `PDF · 2.4 MB · syllabus.pdf`).
 */
export function formatResourceMetaLine(res: SectionResource): string {
  const fileName =
    res.originalFileName?.trim() || deriveFilenameFromResourceUrl(res.url);

  let typeLabel: string;
  if (res.type === "LINK") {
    typeLabel = "Link";
  } else if (res.mimeType?.trim()) {
    const short = res.mimeType.split("/").pop();
    typeLabel = (short || res.mimeType).toUpperCase();
  } else {
    typeLabel = extensionFromUrl(res.url) || "File";
  }

  const parts: string[] = [typeLabel];
  if (res.sizeBytes != null && res.sizeBytes >= 0) {
    parts.push(formatBytes(res.sizeBytes));
  }
  if (fileName) parts.push(fileName);

  return parts.join(" · ");
}
