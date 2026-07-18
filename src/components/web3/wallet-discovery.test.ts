import { describe, expect, it } from "vitest";

import {
  discoverInstalledWallets,
  type WalletConnectorLike
} from "@/components/web3/wallet-discovery";

function connector(
  uid: string,
  name: string,
  provider: unknown,
  rdns?: string
): WalletConnectorLike {
  return { uid, name, rdns, getProvider: async () => provider };
}

describe("discoverInstalledWallets", () => {
  it("prefers named EIP-6963 wallets and deduplicates the generic injected provider", async () => {
    const provider = {};
    const wallets = await discoverInstalledWallets([
      connector("generic", "Injected", provider),
      connector("metamask", "MetaMask", provider, "io.metamask")
    ]);

    expect(wallets).toHaveLength(1);
    expect(wallets[0].name).toBe("MetaMask");
  });

  it("returns no installable wallet when providers are absent", async () => {
    const wallets = await discoverInstalledWallets([
      connector("generic", "Injected", undefined)
    ]);
    expect(wallets).toEqual([]);
  });

  it("keeps distinct installed wallet providers", async () => {
    const wallets = await discoverInstalledWallets([
      connector("metamask", "MetaMask", {}, "io.metamask"),
      connector("coinbase", "Coinbase Wallet", {}, "com.coinbase.wallet")
    ]);
    expect(wallets.map((wallet) => wallet.name)).toEqual(["MetaMask", "Coinbase Wallet"]);
  });
});
