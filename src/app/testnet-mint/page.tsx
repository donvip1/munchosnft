import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TestnetComingSoon } from "@/features/testnet/TestnetComingSoon";

export const metadata: Metadata = {
  title: "Testnet Mint Coming Soon",
  description: "Munchos Genesis testnet minting opens after the official announcement."
};

export default function TestnetMintPage() {
  return <><SiteHeader /><main className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8"><TestnetComingSoon feature="Mint" /></main><SiteFooter /></>;
}
