import { Redis } from "@upstash/redis";
import { expect, test } from "@playwright/test";

test.describe("redis rate limit", () => {
  test("shared counter increments via Upstash when configured", async () => {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    test.skip(!url || !token, "Upstash env vars not set");

    const redis = new Redis({ url: url!, token: token! });
    const key = `rl:e2e:${Date.now()}:${Math.random().toString(36).slice(2)}`;

    const first = await redis.incr(key);
    if (first === 1) await redis.pexpire(key, 60_000);
    const second = await redis.incr(key);
    const third = await redis.incr(key);
    const fourth = await redis.incr(key);
    await redis.del(key);

    expect(first).toBe(1);
    expect(second).toBe(2);
    expect(third).toBe(3);
    expect(fourth).toBe(4);
    expect(fourth > 3).toBe(true);
  });
});
