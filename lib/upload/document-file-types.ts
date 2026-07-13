export const DOCUMENT_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
] as const;

export const DOCUMENT_FILE_ACCEPT = DOCUMENT_FILE_EXTENSIONS.map(
  (ext) => `.${ext}`,
).join(",");

export const DOCUMENT_FILE_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
] as const;

export const DOCUMENT_FILE_DESCRIPTION =
  "PDF, Word, Excel, PowerPoint, or plain text (.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt).";

export function isDocumentFile(file: File): boolean {
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "";
  if (
    DOCUMENT_FILE_EXTENSIONS.includes(
      ext as (typeof DOCUMENT_FILE_EXTENSIONS)[number],
    )
  ) {
    return true;
  }
  return DOCUMENT_FILE_MIMES.includes(
    file.type as (typeof DOCUMENT_FILE_MIMES)[number],
  );
}
