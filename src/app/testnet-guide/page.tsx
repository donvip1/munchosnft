import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, FlaskConical, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestnetGate } from "@/features/testnet/TestnetGate";

export const metadata: Metadata = {
  title: "Testnet Guide",
  description: "How to mint and fuse Munchos NFTs on Robinhood Chain Testnet."
};

const steps = [
  { title: "Connect Wallet", text: "Connect an EVM browser wallet and switch to Robinhood Chain Testnet.", icon: Wallet },
  { title: "Get Testnet ETH", text: "Keep enough testnet ETH for the mint price and network gas.", icon: ShieldCheck },
  { title: "Mint Genesis", text: "Open the Public testnet mint and mint one Genesis NFT for the campaign.", icon: Sparkles },
  { title: "Choose a Recipe", text: "Use one catalyst for Munchos OG or both catalysts for Munchos Legendary.", icon: FlaskConical },
  { title: "Approve and Fuse", text: "Approve Fusion V2, confirm the permanent Genesis burn, and mint the result.", icon: ArrowRight },
  { title: "Check Progress", text: "View the transaction, result metadata, and mainnet-priority status.", icon: CheckCircle2 }
] as const;

export default function TestnetGuidePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <TestnetGate>
          <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow="Testnet Guide" title="Mint. Fuse. Evolve.">
            The complete Munchos testnet path, from wallet connection to OG or Legendary.
          </SectionHeading>

          <div className="mt-10 border-y border-white/10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div className="grid gap-4 border-b border-white/10 py-6 last:border-b-0 sm:grid-cols-[3rem_1fr]" key={step.title}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-lemon/25 bg-lemon/[0.08] text-lemon"><Icon aria-hidden="true" size={20} /></div>
                  <div><p className="text-xs uppercase text-white/40">Step {index + 1}</p><h2 className="mt-1 font-pixel text-xl text-white">{step.title}</h2><p className="mt-2 text-sm leading-6 text-white/60">{step.text}</p></div>
                </div>
              );
            })}
          </div>

          <section className="mt-12">
            <h2 className="font-pixel text-2xl text-white">Testnet Phases</h2>
            <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2">
              <div className="bg-ink p-5"><p className="text-xs uppercase text-lemon">Phase 1</p><h3 className="mt-2 font-pixel text-lg text-white">Public Genesis Mint</h3><p className="mt-2 text-sm text-white/55">Open to all wallets. One Public-phase mint per wallet.</p></div>
              <div className="bg-ink p-5"><p className="text-xs uppercase text-lemon">Phase 2</p><h3 className="mt-2 font-pixel text-lg text-white">Catalyst Fusion</h3><p className="mt-2 text-sm text-white/55">Burn one Genesis for OG or Legendary. Fusion is permanent.</p></div>
            </div>
          </section>

          <section className="mt-12 border-t border-white/10 pt-8">
            <h2 className="font-pixel text-2xl text-white">Mainnet Priority</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">Existing whitelist and collaboration wallets retain their access. Testnet OG and Legendary holders at the announced snapshot are added to the mainnet priority list. Public mainnet mint follows with the remaining supply.</p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3"><LinkButton href="/testnet-mint" size="lg">Mint Testnet Genesis</LinkButton><LinkButton href="/fusion" size="lg" variant="secondary">Open Fusion Lab</LinkButton><LinkButton href="/eligibility" size="lg" variant="ghost">Check Status</LinkButton></div>
          </div>
        </TestnetGate>
      </main>
      <SiteFooter />
    </>
  );
}
