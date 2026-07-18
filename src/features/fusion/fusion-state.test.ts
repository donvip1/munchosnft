import { describe, expect, it } from "vitest";

import { isFusionConfigured, validateFusionInputs } from "@/features/fusion/fusion-state";

describe("fusion state", () => {
  it("requires two distinct numeric token IDs", () => {
    expect(validateFusionInputs("1", "2")).toEqual({ ok: true, tokenIds: [1n, 2n] });
    expect(validateFusionInputs("1", "1")).toMatchObject({ ok: false });
    expect(validateFusionInputs("", "2")).toMatchObject({ ok: false });
    expect(validateFusionInputs("-1", "2")).toMatchObject({ ok: false });
  });

  it("only accepts a non-zero deployed address configuration", () => {
    expect(isFusionConfigured()).toBe(false);
    expect(isFusionConfigured("0x0000000000000000000000000000000000000000")).toBe(false);
    expect(isFusionConfigured("0x1234")).toBe(false);
    expect(isFusionConfigured("0x1111111111111111111111111111111111111111")).toBe(true);
  });
});
