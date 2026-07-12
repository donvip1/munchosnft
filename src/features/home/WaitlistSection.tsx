import { Suspense } from "react";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaitlistCard } from "@/features/waitlist/components/WaitlistCard";

export function WaitlistSection() {
  return (
    <section id="waitlist" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Version 1" title="Exclusive Waitlist System">
          The first live module for Munchos NFT captures community demand, task completion, wallet
          identity, referrals, and launch momentum.
        </SectionHeading>
        <div className="mt-10">
          <Suspense>
            <WaitlistCard />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
