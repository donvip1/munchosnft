import type { Metadata } from "next";
import { Suspense } from "react";

import { WaitlistCard } from "@/features/waitlist/components/WaitlistCard";

export const metadata: Metadata = {
  title: "Join Waitlist",
  description:
    "Join the Munchos NFT waitlist and receive your Robinhood Chain community referral link."
};

export default function WaitlistPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center">
        <div className="w-full">
          <Suspense>
            <WaitlistCard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
