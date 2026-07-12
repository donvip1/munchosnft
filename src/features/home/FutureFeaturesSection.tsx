"use client";

import {
  BarChart3,
  Dna,
  Gem,
  Medal,
  PanelsTopLeft,
  RefreshCw,
  Sparkles,
  Store,
  Trophy,
  UserRound,
  Wallet,
  type LucideIcon
} from "lucide-react";
import { useState } from "react";

import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusPill } from "@/components/ui/StatusPill";
import { futureFeatures } from "@/config/site";

const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  Dna,
  Gem,
  Medal,
  PanelsTopLeft,
  RefreshCw,
  Sparkles,
  Store,
  Trophy,
  UserRound,
  Wallet
};

type Feature = (typeof futureFeatures)[number];

export function FutureFeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Future Modules"
          title="Built Like an App, Ready for the Chain"
        >
          Munchos NFT is structured for wallet sessions, smart contracts, NFT state, rewards, and
          marketplace flows without replacing the Version 1 foundation.
        </SectionHeading>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {futureFeatures.map((feature) => {
            const Icon = iconMap[feature.icon] ?? Sparkles;

            return (
              <button
                className="group min-h-48 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 text-left shadow-glass backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-lemon/35 hover:bg-white/[0.07]"
                key={feature.title}
                type="button"
                onClick={() => setSelectedFeature(feature)}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-lemon transition group-hover:border-lemon/35">
                    <Icon aria-hidden="true" size={21} />
                  </span>
                  <StatusPill tone="white">Coming Soon</StatusPill>
                </div>
                <h3 className="mt-5 font-pixel text-xl text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/58">{feature.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <ComingSoonModal
        title={selectedFeature?.title ?? ""}
        description={
          selectedFeature
            ? `${selectedFeature.description} This module will connect into the same scalable Robinhood Chain-native architecture.`
            : ""
        }
        open={Boolean(selectedFeature)}
        onClose={() => setSelectedFeature(null)}
      />
    </section>
  );
}
