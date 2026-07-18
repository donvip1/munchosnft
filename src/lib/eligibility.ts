import { encodePacked, getAddress, keccak256, type Address, type Hex } from "viem";

export type EligibilityProofBundle = {
  root: Hex;
  count: number;
  proofs: Record<Hex, Hex[]>;
};

export function eligibilityLeaf(address: Address) {
  return keccak256(encodePacked(["address"], [getAddress(address)]));
}

export function lookupEligibility(address: Address, bundle: EligibilityProofBundle) {
  const proof = bundle.proofs[eligibilityLeaf(address)];
  return {
    eligible: Boolean(proof),
    proof: proof ?? [],
    root: bundle.root,
    count: bundle.count
  };
}
