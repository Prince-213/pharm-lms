const TECHNICAL_PATTERNS: RegExp[] = [
  /invalid `prisma/i,
  /prisma\./i,
  /invocation:/i,
  /argument `[\w]+` is missing/i,
  /unique constraint failed/i,
  /foreign key constraint/i,
  /p\d{4}/i,
  /at\s+[\w./\\-]+\.(?:ts|js|tsx|jsx):\d+/i,
  /next-auth/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /ENOTFOUND/i,
];

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

function isTechnicalMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  if (trimmed.length > 220) return true;
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** Map raw errors (API, Prisma, network) to short user-safe text. */
export function toUserFacingError(
  input: unknown,
  fallback = DEFAULT_MESSAGE,
): string {
  if (input === null || input === undefined) return fallback;

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return fallback;
    return isTechnicalMessage(trimmed) ? fallback : trimmed;
  }

  if (input instanceof Error) {
    const trimmed = input.message.trim();
    if (!trimmed) return fallback;
    return isTechnicalMessage(trimmed) ? fallback : trimmed;
  }

  return fallback;
}
