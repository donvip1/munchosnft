import { NextResponse } from "next/server";
import { getAddress, isAddress, type Hex } from "viem";

import proofBundle from "@/data/whitelist-proofs.json";
import { lookupEligibility } from "@/lib/eligibility";

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
  const result = lookupEligibility(checksummed, bundle);

  return NextResponse.json({
    ok: true,
    ...result
  });
}
