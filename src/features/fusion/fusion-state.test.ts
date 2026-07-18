import { describe, expect, it } from "vitest";

import { isFusionConfigured } from "@/features/fusion/fusion-state";

describe("fusion state", () => {
  it("only accepts a non-zero deployed address configuration", () => {
    expect(isFusionConfigured()).toBe(false);
    expect(isFusionConfigured("0x0000000000000000000000000000000000000000")).toBe(false);
    expect(isFusionConfigured("0x1234")).toBe(false);
    expect(isFusionConfigured("0x1111111111111111111111111111111111111111")).toBe(true);
  });
});
