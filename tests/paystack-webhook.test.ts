import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { verifyWebhookSignature } from "../lib/paystack/client.ts";

describe("verifyWebhookSignature", () => {
  const secret = "test-paystack-secret";
  const prev = process.env.PAYSTACK_SECRET_KEY;

  before(() => {
    process.env.PAYSTACK_SECRET_KEY = secret;
  });

  after(() => {
    if (prev === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = prev;
  });

  it("accepts valid HMAC SHA512 hex signature", () => {
    const body = '{"event":"charge.success"}';
    const sig = createHmac("sha512", secret).update(body).digest("hex");
    assert.equal(verifyWebhookSignature(body, sig), true);
  });

  it("rejects missing or wrong signature", () => {
    const body = '{"event":"charge.success"}';
    assert.equal(verifyWebhookSignature(body, null), false);
    assert.equal(verifyWebhookSignature(body, "deadbeef"), false);
  });
});
