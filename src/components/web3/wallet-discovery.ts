export type WalletConnectorLike = {
  uid: string;
  name: string;
  rdns?: string | readonly string[];
  getProvider: () => Promise<unknown>;
};

export type InstalledWallet<T extends WalletConnectorLike = WalletConnectorLike> = {
  connector: T;
  name: string;
};

function connectorName(connector: WalletConnectorLike) {
  return connector.name === "Injected" ? "Browser Wallet" : connector.name;
}

export async function discoverInstalledWallets<T extends WalletConnectorLike>(
  connectors: readonly T[]
): Promise<InstalledWallet<T>[]> {
  const providerSpecificFirst = [...connectors].sort(
    (a, b) => Number(Boolean(b.rdns)) - Number(Boolean(a.rdns))
  );
  const seenProviders = new Set<unknown>();
  const detected: InstalledWallet<T>[] = [];

  for (const connector of providerSpecificFirst) {
    const provider = await connector.getProvider().catch(() => undefined);
    if (!provider || seenProviders.has(provider)) continue;

    seenProviders.add(provider);
    detected.push({ connector, name: connectorName(connector) });
  }

  return detected;
}
