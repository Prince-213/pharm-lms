const SECTION_MARKER_RE = /^Section:([^\n\r]+)[\n\r]+([\s\S]*)$/;
const SECTION_ONLY_RE = /^Section:([^\n\r]+)\s*$/;

export function parseAssignmentDescription(
  description: string | null | undefined,
): {
  sectionId: string | null;
  instructions: string;
} {
  const raw = description?.trim() ?? "";
  if (!raw) return { sectionId: null, instructions: "" };

  const withBody = raw.match(SECTION_MARKER_RE);
  if (withBody) {
    return {
      sectionId: withBody[1].trim(),
      instructions: withBody[2].trim(),
    };
  }

  const markerOnly = raw.match(SECTION_ONLY_RE);
  if (markerOnly) {
    return { sectionId: markerOnly[1].trim(), instructions: "" };
  }

  return { sectionId: null, instructions: raw };
}

export function assignmentDescriptionLooksLikeHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}
