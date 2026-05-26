import type { BlogTag } from "./types";

const DEFAULT_TAG_COLOR =
  "border border-slate-200 bg-slate-50 text-slate-600";

export function parseBlogTags(raw: unknown): BlogTag[] {
  if (!Array.isArray(raw)) return [];
  const tags: BlogTag[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      "label" in item &&
      typeof (item as { label: unknown }).label === "string"
    ) {
      const label = (item as { label: string }).label.trim();
      if (!label) continue;
      const color =
        "color" in item &&
        typeof (item as { color: unknown }).color === "string" &&
        (item as { color: string }).color.trim()
          ? (item as { color: string }).color.trim()
          : DEFAULT_TAG_COLOR;
      tags.push({ label, color });
    }
  }
  return tags;
}
