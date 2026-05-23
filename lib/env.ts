/**
 * Server environment validation. Called from instrumentation on Node startup.
 * In production, missing critical vars fail fast; in dev, warnings only.
 */

const PRODUCTION_PAYMENTS = [
  "PAYSTACK_SECRET_KEY",
  "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
] as const;

export type EnvValidationResult = {
  ok: boolean;
  missing: string[];
  warnings: string[];
};

export function validateServerEnv(): EnvValidationResult {
  const isProd = process.env.NODE_ENV === "production";
  const missing: string[] = [];
  const warnings: string[] = [];

  const hasAuthSecret =
    Boolean(process.env.AUTH_SECRET?.trim()) ||
    Boolean(process.env.NEXTAUTH_SECRET?.trim());

  if (!process.env.DATABASE_URL?.trim()) {
    missing.push("DATABASE_URL");
  }
  if (!hasAuthSecret) {
    missing.push("AUTH_SECRET (or NEXTAUTH_SECRET)");
  }

  if (isProd) {
    for (const key of PRODUCTION_PAYMENTS) {
      if (!process.env[key]?.trim()) {
        warnings.push(`${key} is not set — payments will fail`);
      }
    }
  }

  if (isProd && missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  if (!isProd && missing.length > 0) {
    console.warn(`[env] Missing recommended variables: ${missing.join(", ")}`);
  }
  for (const w of warnings) {
    console.warn(`[env] ${w}`);
  }

  return { ok: missing.length === 0, missing, warnings };
}
