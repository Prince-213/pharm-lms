import {
  DOCUMENT_FILE_EXTENSIONS,
  DOCUMENT_FILE_MIMES,
} from "@/lib/upload/document-file-types";

const videoMimes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

const imageMimes = ["image/jpeg", "image/png", "image/webp"];

const resourceMimes = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export type CourseUploadPurpose =
  | "thumbnail"
  | "course-image"
  | "promo-video"
  | "lesson-video"
  | "congrats-video"
  | "resource-file"
  | "assignment-handout"
  | "curriculum-resource";

export function resolveCourseUploadTarget(purpose: string): {
  folder: string;
  allowed: string[];
} {
  let allowed: string[] = videoMimes;
  let folder = "videos";

  if (purpose === "thumbnail" || purpose === "course-image") {
    allowed = imageMimes;
    folder = "images";
  } else if (purpose === "promo-video" || purpose === "congrats-video") {
    allowed = videoMimes;
    folder = purpose === "congrats-video" ? "congrats" : "promo";
  } else if (purpose === "resource-file" || purpose === "assignment-handout") {
    allowed = resourceMimes;
    folder =
      purpose === "assignment-handout" ? "assignment-handouts" : "resources";
  } else if (purpose === "curriculum-resource") {
    allowed = [...DOCUMENT_FILE_MIMES];
    folder = "resources";
  }

  return { allowed, folder };
}

export function isCourseUploadFileAllowed(
  purpose: string,
  file: Pick<File, "name" | "type">,
): boolean {
  const { allowed } = resolveCourseUploadTarget(purpose);
  if (purpose === "curriculum-resource") {
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
  return allowed.includes(file.type);
}

export function buildCourseUploadKey(
  courseId: string,
  purpose: string,
  fileName: string,
): string {
  const { folder } = resolveCourseUploadTarget(purpose);
  const ext = fileName.includes(".") ? fileName.split(".").pop() : "bin";
  return `courses/${courseId}/${folder}/${crypto.randomUUID()}.${ext}`;
}

/** Infer MIME when the browser leaves File.type empty (common for some video/docs). */
export function resolveUploadContentType(
  fileName: string,
  reportedType: string,
): string {
  const trimmed = reportedType.trim();
  if (trimmed) return trimmed;

  const ext = fileName.includes(".")
    ? fileName.split(".").pop()!.toLowerCase()
    : "";
  switch (ext) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    case "mkv":
      return "video/x-matroska";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "txt":
      return "text/plain";
    case "zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

