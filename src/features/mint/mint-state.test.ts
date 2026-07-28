import { describe, expect, it } from "vitest";

import { getMintState, getMintTransaction, type MintStateInput } from "@/features/mint/mint-state";

const ready: MintStateInput = {
  ended: false,
  connected: true,
  wrongChain: false,
  paused: false,
  remainingPublic: 100n,
  alreadyMinted: false,
  phase: 2,
  proofLoading: false,
  eligible: true,
  proofRootActive: true
};

describe("getMintState", () => {
  it("allows an eligible whitelist wallet only when the active root matches", () => {
    expect(getMintState(ready)).toEqual({ label: "Mint Whitelist", canMint: true });
    expect(getMintState({ ...ready, proofRootActive: false })).toEqual({
      label: "Whitelist Root Pending",
      canMint: false
    });
  });

  it("allows an eligible GTD wallet and selects the GTD entrypoint", () => {
    expect(getMintState({ ...ready, phase: 1 })).toEqual({ label: "Mint GTD", canMint: true });
    expect(getMintTransaction(1, ["0x1234"])).toEqual({ functionName: "mintGTD", args: [["0x1234"]] });
    expect(getMintTransaction(2, ["0x1234"])?.functionName).toBe("mintWhitelist");
    expect(getMintTransaction(3).functionName).toBe("mintPublic");
  });

  it("blocks ineligible, repeated, paused, and closed mint states", () => {
    expect(getMintState({ ...ready, eligible: false }).label).toBe("Not Eligible");
    expect(getMintState({ ...ready, alreadyMinted: true }).label).toBe("Already Minted");
    expect(getMintState({ ...ready, paused: true }).label).toBe("Mint Paused");
    expect(getMintState({ ...ready, phase: 0 })).toEqual({ label: "Mint Closed", canMint: false });
    expect(getMintState({ ...ready, phase: 1, eligible: false }).label).toBe("Not Eligible");
  });

  it("blocks all mint states after the testnet deadline", () => {
    expect(getMintState({ ...ready, ended: true })).toEqual({
      label: "Testnet Ended",
      canMint: false
    });
    expect(getMintState({ ...ready, ended: true, connected: false, wrongChain: true })).toEqual({
      label: "Testnet Ended",
      canMint: false
    });
  });

  it("requires connection and the correct network", () => {
    expect(getMintState({ ...ready, connected: false }).label).toBe("Connect Wallet");
    expect(getMintState({ ...ready, wrongChain: true }).label).toBe("Switch Network");
  });
});
