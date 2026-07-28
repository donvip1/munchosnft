import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MintSection } from "@/features/mint/MintSection";
import { TestnetGate } from "@/features/testnet/TestnetGate";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Testnet Genesis Mint",
  description: "Public Robinhood Chain Testnet mint console for Munchos Genesis."
};

export default function TestnetMintPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-24">
        <TestnetGate>
          <div className="mx-auto flex max-w-6xl justify-end px-4 pt-5 sm:px-6 lg:px-8"><LinkButton href="/testnet-guide" size="sm" variant="ghost">Testnet Guide</LinkButton></div>
          <MintSection />
        </TestnetGate>
      </main>
      <SiteFooter />
    </>
  );
}
