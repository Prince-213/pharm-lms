/**
 * Retries Prisma / pg operations on transient network and server errors
 * (DNS blips, connection drops, Neon pooler hiccups).
 */
function flattenErrorParts(error: unknown, depth = 0): string[] {
  if (depth > 8 || error == null) return [];
  const e = error as Record<string, unknown>;
  const out: string[] = [];
  if (typeof e.message === "string") out.push(e.message);
  if (typeof e.code === "string") out.push(e.code);
  if (typeof e.name === "string") out.push(e.name);
  if (e.cause) out.push(...flattenErrorParts(e.cause, depth + 1));
  const meta = e.meta;
  if (meta && typeof meta === "object") {
    const m = meta as Record<string, unknown>;
    if (m.driverAdapterError)
      out.push(...flattenErrorParts(m.driverAdapterError, depth + 1));
  }
  return out;
}

function isTransientDbError(error: unknown): boolean {
  const e = error as {
    code?: string;
    cause?: { code?: string; message?: string };
    message?: string;
  };
  const codes = new Set(
    [e.code, (e.cause as { code?: string } | undefined)?.code].filter(
      (c): c is string => typeof c === "string",
    ),
  );
  if (codes.has("P1017")) return true;
  if (
    codes.has("EAI_AGAIN") ||
    codes.has("ETIMEDOUT") ||
    codes.has("ECONNRESET")
  ) {
    return true;
  }

  const blob = flattenErrorParts(error).join(" ").toLowerCase();
  if (blob.includes("getaddrinfo eai_again") || blob.includes(" eai_again"))
    return true;
  if (blob.includes("connection terminated") || blob.includes("econnreset"))
    return true;
  if (blob.includes("connectionclosed") || blob.includes("connection closed"))
    return true;
  if (blob.includes("server has closed the connection")) return true;
  if (blob.includes("socket closed") || blob.includes("broken pipe"))
    return true;
  return false;
}

export async function withDbRetry<T>(
  run: () => Promise<T>,
  attempts = 5,
): Promise<T> {
  let lastError: unknown;
  const delaysMs = [250, 600, 1200, 2000, 3000];
  for (let i = 0; i < attempts; i++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (!isTransientDbError(error) || i === attempts - 1) throw error;
      await new Promise((r) => setTimeout(r, delaysMs[i] ?? 2000));
    }
  }
  throw lastError;
}
