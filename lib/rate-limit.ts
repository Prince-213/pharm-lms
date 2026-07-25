import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

/**
 * Rate limiter for abuse-prone routes (AI, auth, marketing forms).
 * Uses Upstash Redis when configured; falls back to in-memory per process.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_KEYS = 10_000;

let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    redisClient = null;
    return null;
  }
  redisClient = new Redis({ url, token });
  return redisClient;
}

function pruneExpired(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitOptions = {
  /** Max requests per window */
  limit: number;
  /** Window length in milliseconds */
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

function checkMemoryRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + options.windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const allowed = bucket.count <= options.limit;
  return {
    allowed,
    remaining: Math.max(0, options.limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

async function checkRedisRateLimit(
  redis: Redis,
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const redisKey = `rl:${key}`;
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.pexpire(redisKey, options.windowMs);
  }
  const ttl = await redis.pttl(redisKey);
  const resetAt = Date.now() + (ttl > 0 ? ttl : options.windowMs);
  return {
    allowed: count <= options.limit,
    remaining: Math.max(0, options.limit - count),
    resetAt,
  };
}

export async function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    return checkMemoryRateLimit(key, options);
  }

  try {
    return await checkRedisRateLimit(redis, key, options);
  } catch (error) {
    console.error("[rate-limit] Redis unavailable; using memory fallback", error);
    return checkMemoryRateLimit(key, options);
  }
}

export function rateLimitResponse(resetAt: number) {
  const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}
