import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FusionLab } from "@/features/fusion/FusionLab";

export const metadata: Metadata = {
  title: "Testnet Fusion Lab",
  description: "Fuse two Munchos Genesis NFTs on Robinhood Chain Testnet."
};

export default function FusionPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <FusionLab />
      </main>
      <SiteFooter />
    </>
  );
}
