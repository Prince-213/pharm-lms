import { SectionResource } from "@/components/mentor/curriculum-editor-v2";

export function parseSectionDescription(raw: string | null): {
  text: string;
  resources: SectionResource[];
} {
  if (!raw) return { text: "", resources: [] };
  try {
    const parsed = JSON.parse(raw) as { text?: string; resources?: SectionResource[] };
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return {
        text: typeof parsed.text === "string" ? parsed.text : "",
        resources: Array.isArray(parsed.resources) ? parsed.resources : [],
      };
    }
  } catch {
    /* legacy plain-text description */
  }
  return { text: raw, resources: [] };
}
