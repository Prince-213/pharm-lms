import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutBucketCorsCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.R2_ENDPOINT;
const region = process.env.R2_REGION ?? "auto";
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
export const r2Bucket = process.env.R2_BUCKET_NAME;

if (!endpoint || !accessKeyId || !secretAccessKey || !r2Bucket) {
  console.warn(
    "R2 environment variables missing. Storage actions will fail until configured.",
  );
}

export function isR2Configured() {
  return Boolean(endpoint && accessKeyId && secretAccessKey && r2Bucket);
}

export const r2Client = new S3Client({
  region,
  endpoint,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
});

export async function uploadToR2(input: Omit<PutObjectCommandInput, "Bucket">) {
  const command = new PutObjectCommand({
    Bucket: r2Bucket,
    ...input,
  });
  return r2Client.send(command);
}

export async function getR2SignedGetUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: r2Bucket,
    Key: key,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
}

export async function getR2SignedPutUrl(
  key: string,
  contentType: string,
  _contentLength?: number,
  expiresIn = 3600,
) {
  // Sign Content-Type so the browser PUT must send the same header.
  // CORS on the bucket must allow PUT from the app origin.
  const command = new PutObjectCommand({
    Bucket: r2Bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
}

function normalizeOrigin(raw: string | undefined | null): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    return url.origin;
  } catch {
    return null;
  }
}

/** Origins allowed to PUT/GET objects from the browser (presigned uploads). */
export function getR2UploadCorsOrigins(): string[] {
  const fromEnv = (process.env.R2_CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => normalizeOrigin(s))
    .filter((v): v is string => Boolean(v));

  const defaults = [
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL),
    normalizeOrigin(process.env.AUTH_URL),
    normalizeOrigin(process.env.NEXTAUTH_URL),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter((v): v is string => Boolean(v));

  return [...new Set([...fromEnv, ...defaults])];
}

let corsEnsurePromise: Promise<void> | null = null;

/**
 * Ensure the R2 bucket accepts browser PUTs from this app (and localhost).
 * Safe to call often — coalesces concurrent callers into one request.
 */
export async function ensureR2UploadCors(): Promise<void> {
  if (!isR2Configured() || !r2Bucket) return;

  if (!corsEnsurePromise) {
    corsEnsurePromise = (async () => {
      const origins = getR2UploadCorsOrigins();
      if (origins.length === 0) return;

      await r2Client.send(
        new PutBucketCorsCommand({
          Bucket: r2Bucket,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedOrigins: origins,
                AllowedMethods: ["GET", "PUT", "HEAD"],
                AllowedHeaders: ["*"],
                ExposeHeaders: ["ETag", "Content-Type", "Content-Length"],
                MaxAgeSeconds: 3600,
              },
            ],
          },
        }),
      );
    })().catch((err) => {
      // Allow a later retry if this attempt failed (e.g. transient network).
      corsEnsurePromise = null;
      throw err;
    });
  }

  await corsEnsurePromise;
}

/** List all object keys under a prefix (paginated). */
export async function listR2ObjectKeys(prefix: string): Promise<string[]> {
  if (!isR2Configured() || !r2Bucket) return [];

  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const res = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: r2Bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

/** List every object key in the bucket (paginated). */
export async function listAllR2ObjectKeys(): Promise<string[]> {
  return listR2ObjectKeys("");
}

/** Delete up to 1000 keys per request (S3 limit). */
export async function deleteR2ObjectKeys(keys: string[]): Promise<void> {
  if (!isR2Configured() || !r2Bucket || keys.length === 0) return;

  const chunkSize = 1000;
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = keys.slice(i, i + chunkSize);
    await r2Client.send(
      new DeleteObjectsCommand({
        Bucket: r2Bucket,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    );
  }
}
