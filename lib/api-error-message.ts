/** Best-effort message from fetch JSON error payloads (Zod flatten, strings, etc.). */
import { toUserFacingError } from "@/lib/user-facing-error";

export function formatApiErrorBody(body: unknown): string {
  if (body === null || body === undefined) {
    return "Request failed. Please try again.";
  }
  if (typeof body !== "object") {
    return "Request failed. Please try again.";
  }
  const o = body as Record<string, unknown>;

  if (o.details && typeof o.details === "object") {
    const d = o.details as Record<string, unknown>;
    const field = d.fieldErrors as Record<string, string[] | unknown> | undefined;
    if (field && typeof field === "object") {
      const parts = Object.entries(field).flatMap(([key, msgs]) =>
        Array.isArray(msgs)
          ? msgs
              .filter((m): m is string => typeof m === "string")
              .map((m) => `${key}: ${m}`)
          : [],
      );
      if (parts.length) {
        return toUserFacingError(parts.join(" "), "Please check the form and try again.");
      }
    }
    const form = d.formErrors as unknown;
    if (Array.isArray(form)) {
      const msgs = form.filter((x): x is string => typeof x === "string");
      if (msgs.length) {
        return toUserFacingError(msgs.join(" "), "Please check the form and try again.");
      }
    }
  }

  if (typeof o.error === "string" && o.error.trim()) {
    return toUserFacingError(o.error, "Could not complete the request. Please try again.");
  }

  return "Could not complete the request. Please try again.";
}
