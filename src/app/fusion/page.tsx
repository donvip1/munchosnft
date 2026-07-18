import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TestnetComingSoon } from "@/features/testnet/TestnetComingSoon";

export const metadata: Metadata = {
  title: "Testnet Fusion Coming Soon",
  description: "Munchos Catalyst Fusion opens after the official announcement."
};

export default function FusionPage() {
  return <><SiteHeader /><main className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8"><TestnetComingSoon feature="Fusion" /></main><SiteFooter /></>;
}
