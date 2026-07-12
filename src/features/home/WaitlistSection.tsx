import { ArrowRight, ShieldCheck } from "lucide-react";

import { LinkButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function WaitlistSection() {
  return (
    <section id="waitlist" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow="Version 1" title="Exclusive Waitlist System">
          The first live module for Munchos NFT captures community demand, task completion, wallet
          identity, referrals, and launch momentum.
        </SectionHeading>

        <GlassCard className="mt-10 p-5 text-center sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-lemon/35 bg-lemon/10 text-lemon shadow-lemon">
            <ShieldCheck aria-hidden="true" size={25} />
          </div>
          <h3 className="mt-5 font-pixel text-2xl text-white sm:text-3xl">
            Secure your Munchos NFT access
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
            Open the dedicated waitlist page to complete the X tasks, submit your wallet, and
            receive your referral link.
          </p>
          <LinkButton className="mt-6" href="/waitlist" size="lg">
            Join Waitlist
            <ArrowRight aria-hidden="true" size={18} />
          </LinkButton>
        </GlassCard>
      </div>
    </section>
  );
}
