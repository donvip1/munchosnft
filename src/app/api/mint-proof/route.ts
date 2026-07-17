import { NextResponse } from "next/server";
import { encodePacked, getAddress, isAddress, keccak256, type Hex } from "viem";

import proofBundle from "@/data/whitelist-proofs.json";

type ProofBundle = {
  phase: string;
  root: Hex;
  count: number;
  proofs: Record<Hex, Hex[]>;
};

const bundle = proofBundle as unknown as ProofBundle;

export function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address")?.trim() ?? "";

  if (!isAddress(address)) {
    return NextResponse.json({ ok: false, message: "A valid wallet address is required." }, { status: 400 });
  }

  const checksummed = getAddress(address);
  const leaf = keccak256(encodePacked(["address"], [checksummed]));
  const proof = bundle.proofs[leaf];

  return NextResponse.json({
    ok: true,
    eligible: Boolean(proof),
    proof: proof ?? [],
    root: bundle.root,
    count: bundle.count
  });
}
