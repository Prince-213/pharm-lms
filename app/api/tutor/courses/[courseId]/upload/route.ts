import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isR2Configured, uploadToR2 } from "@/lib/storage/r2";
import {
  requireMentorCourse,
  requireMentorCourseEditable,
} from "@/lib/mentor-course-auth";

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
  }

  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type for this upload." }, { status: 400 });
  }


  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const key = `courses/${courseId}/${folder}/${crypto.randomUUID()}.${ext}`;

  if (isR2Configured()) {
    await uploadToR2({
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });
    return NextResponse.json({ key, url: `r2://${key}` }, { status: 201 });
  }

  /** Dev / local fallback: files under `public/` are served statically at `/…`. */
  const publicRoot = path.join(process.cwd(), "public");
  const diskPath = path.join(publicRoot, ...key.split("/"));
  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, buffer);

  return NextResponse.json({ key, url: `/${key}` }, { status: 201 });
}
