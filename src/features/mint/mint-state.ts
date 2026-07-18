export type MintStateInput = {
  connected: boolean;
  wrongChain: boolean;
  paused: boolean;
  remainingPublic: bigint;
  alreadyMinted: boolean;
  phase: number;
  proofLoading: boolean;
  eligible: boolean;
  proofRootActive: boolean;
};

export function getMintTransaction(phase: number, proof: readonly `0x${string}`[] = []) {
  if (phase === 1) return { functionName: "mintGTD" as const, args: [proof] };
  if (phase === 2) return { functionName: "mintWhitelist" as const, args: [proof] };
  return { functionName: "mintPublic" as const, args: [] as const };
}

export function getMintState(input: MintStateInput) {
  let label = "Mint Closed";
  if (!input.connected) label = "Connect Wallet";
  else if (input.wrongChain) label = "Switch Network";
  else if (input.paused) label = "Mint Paused";
  else if (input.remainingPublic === 0n) label = "Sold Out";
  else if (input.alreadyMinted) label = "Already Minted";
  else if ((input.phase === 1 || input.phase === 2) && input.proofLoading) label = "Checking Eligibility";
  else if ((input.phase === 1 || input.phase === 2) && !input.eligible) label = "Not Eligible";
  else if (input.phase === 1 && !input.proofRootActive) label = "GTD Root Pending";
  else if (input.phase === 2 && !input.proofRootActive) label = "Whitelist Root Pending";
  else if (input.phase === 1) label = "Mint GTD";
  else if (input.phase === 2) label = "Mint Whitelist";
  else if (input.phase === 3) label = "Mint Public";

  const canMint =
    input.connected &&
    !input.wrongChain &&
    !input.paused &&
    !input.alreadyMinted &&
    input.remainingPublic > 0n &&
    (((input.phase === 1 || input.phase === 2) && input.eligible && input.proofRootActive) || input.phase === 3);

  return { label, canMint };
}
