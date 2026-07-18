import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MintSection } from "@/features/mint/MintSection";

export const metadata: Metadata = {
  title: "Testnet Genesis Mint",
  description: "Private Robinhood Chain Testnet mint console for Munchos Genesis testing."
};

export default function TestnetMintPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-24">
        <MintSection />
      </main>
      <SiteFooter />
    </>
  );
}
