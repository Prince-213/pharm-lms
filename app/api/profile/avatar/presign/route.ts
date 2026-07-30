import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import {
  ensureR2UploadCors,
  getR2SignedPutUrl,
  isR2Configured,
  R2_MAX_UPLOAD_BYTES,
} from "@/lib/storage/r2";
import { resolveUploadContentType } from "@/lib/upload/course-upload-purpose";

const imageMimes = ["image/jpeg", "image/png", "image/webp"] as const;

const allowedRoles: UserRole[] = [
  UserRole.STUDENT,
  UserRole.TUTOR,
  UserRole.MENTOR,
];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "Direct storage upload is not configured.", code: "R2_UNAVAILABLE" },
      { status: 503 },
    );
  }

  let body: {
    fileName?: string;
    contentType?: string;
    contentLength?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

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

  if (contentLength > R2_MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: `File exceeds the maximum upload size of ${Math.floor(R2_MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
      },
      { status: 413 },
    );
  }

  if (!imageMimes.includes(contentType as (typeof imageMimes)[number])) {
    return NextResponse.json(
      { error: "Use JPG, PNG, or WebP." },
      { status: 400 },
    );
  }

  const ext = fileName.includes(".") ? fileName.split(".").pop() : "bin";
  const key = `profiles/${session.user.id}/avatars/${crypto.randomUUID()}.${ext}`;

  try {
    await ensureR2UploadCors().catch((err) => {
      console.warn("[avatar/presign] Could not ensure R2 CORS:", err);
    });

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
    console.error("[avatar/presign] failed:", err);
    return NextResponse.json(
      { error: "Could not start avatar upload. Try again." },
      { status: 502 },
    );
  }
}
