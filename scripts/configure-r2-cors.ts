/**
 * Apply CORS rules so browsers can PUT/GET via presigned URLs.
 *
 * Usage: pnpm db:r2-cors
 * Optional: R2_CORS_ORIGINS=https://app.example.com,http://localhost:3000
 */
import "dotenv/config";
import {
  ensureR2UploadCors,
  getR2UploadCorsOrigins,
  isR2Configured,
  r2Bucket,
} from "../lib/storage/r2";

async function main() {
  if (!isR2Configured()) {
    console.error("R2 is not configured. Set R2_* env vars first.");
    process.exit(1);
  }

  const origins = getR2UploadCorsOrigins();
  console.log(`Configuring CORS on bucket "${r2Bucket}" for origins:`);
  for (const origin of origins) {
    console.log(`  - ${origin}`);
  }

  try {
    await ensureR2UploadCors();
  } catch (err) {
    const code =
      err && typeof err === "object" && "Code" in err
        ? String((err as { Code: unknown }).Code)
        : "";
    if (code === "AccessDenied") {
      console.error(`
AccessDenied: this R2 API token cannot change bucket CORS.

Fix in Cloudflare Dashboard:
  R2 → bucket "${r2Bucket}" → Settings → CORS policy → Add

Use Allowed Origins: the list above
Allowed Methods: GET, PUT, HEAD
Allowed Headers: *
Expose Headers: ETag

Until CORS is set, the app falls back to server-side uploads (works on
local/self-hosted Node; large files on Vercel still need CORS).
`);
      process.exit(1);
    }
    throw err;
  }

  console.log("R2 CORS updated. Browser uploads to this bucket should work now.");
}

main().catch((err) => {
  console.error("Failed to configure R2 CORS:", err);
  process.exit(1);
});
