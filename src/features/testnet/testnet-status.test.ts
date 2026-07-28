import { describe, expect, it } from "vitest";

import { getTestnetCountdown, hasTestnetEnded } from "@/features/testnet/testnet-status";

const cutoff = Date.parse("2026-07-28T23:59:00+01:00");

describe("testnet status", () => {
  it("remains open immediately before the cutoff", () => {
    expect(hasTestnetEnded(cutoff - 1, cutoff)).toBe(false);
  });

  it("ends exactly at the cutoff and remains ended afterward", () => {
    expect(hasTestnetEnded(cutoff, cutoff)).toBe(true);
    expect(hasTestnetEnded(cutoff + 60_000, cutoff)).toBe(true);
  });

  it("returns a stable countdown and clamps expired campaigns to zero", () => {
    expect(getTestnetCountdown(cutoff - 90_061_000, cutoff)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1
    });
    expect(getTestnetCountdown(cutoff + 1, cutoff)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
  });
});
