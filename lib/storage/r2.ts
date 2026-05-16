import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
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
  contentLength: number,
  expiresIn = 3600,
) {
  const command = new PutObjectCommand({
    Bucket: r2Bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
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
