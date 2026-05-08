import {
  GetObjectCommand,
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
