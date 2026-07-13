import { NextResponse } from "next/server";
import { toUserFacingError } from "@/lib/user-facing-error";

export function jsonError(
  input: unknown,
  status: number,
  fallback: string,
): NextResponse {
  return NextResponse.json(
    { error: toUserFacingError(input, fallback) },
    { status },
  );
}
