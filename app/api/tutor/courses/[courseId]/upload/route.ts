import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/json-error";
import { revalidateCourseSurfaces } from "@/lib/cache/revalidate-portals";
import {
  requireMentorCourse,
  requireMentorCourseEditable,
} from "@/lib/mentor-course-auth";
import {
  buildCourseUploadKey,
  isCourseUploadFileAllowed,
} from "@/lib/upload/course-upload-purpose";
import { isR2Configured, uploadToR2 } from "@/lib/storage/r2";

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const formDataEarly = await request.formData();
  const purposeEarly = String(formDataEarly.get("purpose") ?? "lesson-video");

  const authz =
    purposeEarly === "assignment-handout"
      ? await requireMentorCourse(courseId)
      : await requireMentorCourseEditable(courseId);
  if ("error" in authz) return authz.error;

  const formData = formDataEarly;
  const file = formData.get("file");
  const purpose = purposeEarly;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!isCourseUploadFileAllowed(purpose, file)) {
    return NextResponse.json(
      { error: "Unsupported file type for this upload." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = buildCourseUploadKey(courseId, purpose, file.name);

  if (isR2Configured()) {
    try {
      await uploadToR2({
        Key: key,
        Body: buffer,
        ContentType: file.type,
      });
      revalidateCourseSurfaces(courseId);
      return NextResponse.json({ key, url: `r2://${key}` }, { status: 201 });
    } catch (err) {
      console.error("[upload] R2 upload failed:", err);
      return jsonError(err, 502, "Upload failed. Please try again.");
    }
  }

  if (isProductionRuntime()) {
    return jsonError(
      null,
      503,
      "File uploads are temporarily unavailable. Please try again later.",
    );
  }

  try {
    const publicRoot = path.join(process.cwd(), "public");
    const diskPath = path.join(publicRoot, ...key.split("/"));
    await mkdir(path.dirname(diskPath), { recursive: true });
    await writeFile(diskPath, buffer);
    revalidateCourseSurfaces(courseId);
    return NextResponse.json({ key, url: `/${key}` }, { status: 201 });
  } catch (err) {
    console.error("[upload] local fallback failed:", err);
    return jsonError(err, 502, "Upload failed. Please try again.");
  }
}
