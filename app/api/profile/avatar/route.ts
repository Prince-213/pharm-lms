import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { isR2Configured } from "@/lib/storage/r2";

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

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  if (!imageMimes.includes(file.type as (typeof imageMimes)[number])) {
    return NextResponse.json(
      { error: "Use JPG, PNG, or WebP." },
      { status: 400 },
    );
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const userId = session.user.id;
  const key = `profiles/${userId}/avatars/${crypto.randomUUID()}.${ext}`;

  if (isR2Configured()) {
    return NextResponse.json(
      {
        error:
          "Direct storage upload is required when R2 is configured. Refresh the page and try again.",
      },
      { status: 409 },
    );
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "File storage is not configured." },
      { status: 503 },
    );
  }

  const publicRoot = path.join(process.cwd(), "public");
  const diskPath = path.join(publicRoot, ...key.split("/"));
  const buffer = Buffer.from(await file.arrayBuffer());
  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, buffer);

  return NextResponse.json({ url: `/${key}` }, { status: 201 });
}
