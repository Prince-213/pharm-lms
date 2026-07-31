export function sectionNumber(sectionIndex: number): string {
  return String(sectionIndex + 1);
}

export function contentUnitNumber(
  sectionIndex: number,
  lessonIndex: number,
): string {
  return `${sectionNumber(sectionIndex)}.${lessonIndex + 1}`;
}

export function sectionLabel(sectionIndex: number, title?: string): string {
  const n = sectionNumber(sectionIndex);
  const trimmed = title?.trim();
  return trimmed ? `Section ${n}: ${trimmed}` : `Section ${n}`;
}
