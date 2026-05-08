/** Best-effort message from fetch JSON error payloads (Zod flatten, strings, etc.). */
export function formatApiErrorBody(body: unknown): string {
  if (body === null || body === undefined) {
    return "Request failed (empty response).";
  }
  if (typeof body !== "object") {
    return "Request failed.";
  }
  const o = body as Record<string, unknown>;

  if (o.details && typeof o.details === "object") {
    const d = o.details as Record<string, unknown>;
    const field = d.fieldErrors as Record<string, string[] | unknown> | undefined;
    if (field && typeof field === "object") {
      const parts = Object.entries(field).flatMap(([key, msgs]) =>
        Array.isArray(msgs)
          ? msgs.filter((m): m is string => typeof m === "string").map((m) => `${key}: ${m}`)
          : [],
      );
      if (parts.length) return parts.join(" ");
    }
    const form = d.formErrors as unknown;
    if (Array.isArray(form)) {
      const msgs = form.filter((x): x is string => typeof x === "string");
      if (msgs.length) return msgs.join(" ");
    }
  }

  if (typeof o.error === "string" && o.error.trim()) {
    return o.error.trim();
  }

  return "Could not create the course. Try again.";
}
