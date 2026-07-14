import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import {
  requireMentorCourse,
  requireMentorCourseEditable,
} from "@/lib/mentor-course-auth";
import {
  buildCourseUploadKey,
  isCourseUploadFileAllowed,
  resolveUploadContentType,
} from "@/lib/upload/course-upload-purpose";
import { getR2SignedPutUrl, isR2Configured } from "@/lib/storage/r2";

/**
 * Issue a short-lived R2 PUT URL so the browser can upload large files
 * directly (avoids Next.js / Vercel request body size limits).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "Direct storage upload is not configured.", code: "R2_UNAVAILABLE" },
      { status: 503 },
    );
  }

  let body: {
    purpose?: string;
    fileName?: string;
    contentType?: string;
    contentLength?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const purpose = String(body.purpose ?? "lesson-video");
  const fileName = String(body.fileName ?? "").trim();
  const contentType = resolveUploadContentType(
    fileName,
    String(body.contentType ?? ""),
  );
  const contentLength = Number(body.contentLength ?? 0);

  if (!fileName || !Number.isFinite(contentLength) || contentLength <= 0) {
    return NextResponse.json(
      { error: "fileName and contentLength are required." },
      { status: 400 },
    );
  }

  const authz =
    purpose === "assignment-handout"
      ? await requireMentorCourse(courseId)
      : await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  if (!isCourseUploadFileAllowed(purpose, { name: fileName, type: contentType })) {
    return NextResponse.json(
      { error: "Unsupported file type for this upload." },
      { status: 400 },
    );
  }

  const key = buildCourseUploadKey(courseId, purpose, fileName);

  try {
    const uploadUrl = await getR2SignedPutUrl(
      key,
      contentType,
      contentLength,
      60 * 60,
    );
    return NextResponse.json({
      key,
      uploadUrl,
      contentType,
      url: `r2://${key}`,
    });
  } catch (err) {
    console.error("[upload/presign] failed:", err);
    return jsonError(err, 502, "Could not start file upload. Try again.");
  }
}
