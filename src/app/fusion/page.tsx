import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FusionLab } from "@/features/fusion/FusionLab";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Testnet Fusion Lab",
  description: "Fuse one Munchos Genesis with virtual catalysts on Robinhood Chain Testnet."
};

export default function FusionPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto mb-5 flex max-w-6xl justify-end"><LinkButton href="/testnet-guide" size="sm" variant="ghost">Testnet Guide</LinkButton></div>
        <FusionLab />
      </main>
      <SiteFooter />
    </>
  );
}
