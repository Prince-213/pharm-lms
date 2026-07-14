import { resolveMediaUrl } from "@/lib/media-url";
import type { CourseContextResource } from "@/lib/ai/course-context";

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 512_000;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchTextFromUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/html,text/plain,*/*" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return null;
    const text = new TextDecoder("utf-8").decode(buf);
    return stripHtml(text).slice(0, 2000) || null;
  } catch {
    return null;
  }
}

async function fetchFileText(
  url: string,
  mimeType?: string | null,
): Promise<string | null> {
  const isText =
    mimeType?.startsWith("text/") ||
    url.toLowerCase().endsWith(".txt") ||
    url.toLowerCase().endsWith(".md");
  if (!isText) return null;
  try {
    const resolved = await resolveMediaUrl(url);
    if (!resolved) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(resolved, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 2000).trim() || null;
  } catch {
    return null;
  }
}

export async function enrichResourceForAi(resource: {
  type: "FILE" | "LINK";
  title: string;
  url: string;
  mimeType?: string | null;
}): Promise<CourseContextResource> {
  if (resource.type === "LINK") {
    const bodyText = await fetchTextFromUrl(resource.url);
    return { ...resource, bodyText };
  }
  const bodyText = await fetchFileText(resource.url, resource.mimeType);
  return { ...resource, bodyText };
}
