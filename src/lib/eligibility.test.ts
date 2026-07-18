import { describe, expect, it } from "vitest";
import type { Address, Hex } from "viem";

import {
  eligibilityLeaf,
  lookupEligibility,
  type EligibilityProofBundle
} from "@/lib/eligibility";

const eligibleAddress = "0x1111111111111111111111111111111111111111" as Address;
const otherAddress = "0x2222222222222222222222222222222222222222" as Address;
const proof = [`0x${"ab".repeat(32)}`] as Hex[];
const bundle: EligibilityProofBundle = {
  root: `0x${"cd".repeat(32)}` as Hex,
  count: 1,
  proofs: { [eligibilityLeaf(eligibleAddress)]: proof }
};

describe("lookupEligibility", () => {
  it("returns the stored proof for an eligible wallet", () => {
    expect(lookupEligibility(eligibleAddress, bundle)).toEqual({
      eligible: true,
      proof,
      root: bundle.root,
      count: 1
    });
  });

  it("returns an empty proof for an ineligible wallet", () => {
    expect(lookupEligibility(otherAddress, bundle).eligible).toBe(false);
    expect(lookupEligibility(otherAddress, bundle).proof).toEqual([]);
  });
});
