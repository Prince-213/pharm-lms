import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeFeeSplit } from "../lib/payments/fee-split.ts";

describe("computeFeeSplit", () => {
  it("splits platform fee and mentor net from amount", () => {
    const { platformFeeMinorUnits, netToMentorMinorUnits } = computeFeeSplit(
      10_000,
      15,
    );
    assert.equal(platformFeeMinorUnits, 1500);
    assert.equal(netToMentorMinorUnits, 8500);
    assert.equal(platformFeeMinorUnits + netToMentorMinorUnits, 10_000);
  });

  it("clamps fee percent to 0–100", () => {
    const over = computeFeeSplit(1000, 200);
    assert.equal(over.platformFeeMinorUnits, 1000);
    assert.equal(over.netToMentorMinorUnits, 0);

    const under = computeFeeSplit(1000, -5);
    assert.equal(under.platformFeeMinorUnits, 0);
    assert.equal(under.netToMentorMinorUnits, 1000);
  });
});
