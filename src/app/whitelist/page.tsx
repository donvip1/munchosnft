import type { Metadata } from "next";
import { Suspense } from "react";

import { WhitelistCard } from "@/features/whitelist/components/WhitelistCard";

export const metadata: Metadata = {
  title: "Join Whitelist",
  description:
    "Join the Munchos NFT whitelist and receive your Robinhood Chain community referral link."
};

export default function WhitelistPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center">
        <div className="w-full">
          <Suspense>
            <WhitelistCard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
