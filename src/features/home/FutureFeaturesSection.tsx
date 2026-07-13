"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Dna,
  Gem,
  Medal,
  Menu,
  PanelsTopLeft,
  RefreshCw,
  Sparkles,
  Store,
  Trophy,
  UserRound,
  Wallet,
  X,
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
  const [menuOpen, setMenuOpen] = useState(false);

  function openFeature(feature: Feature) {
    setMenuOpen(false);
    setSelectedFeature(feature);
  }

  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <SectionHeading
          eyebrow="Future Modules"
          title="Built Like an App, Ready for the Chain"
        >
          Munchos NFT is structured for wallet sessions, smart contracts, NFT state, rewards, and
          marketplace flows without replacing the waitlist foundation.
        </SectionHeading>

        <button
          className="mx-auto mt-10 inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-lemon/40 bg-lemon px-6 font-pixel text-sm uppercase text-black shadow-lemon transition hover:bg-lemon-soft"
          type="button"
          onClick={() => setMenuOpen(true)}
        >
          <Menu aria-hidden="true" size={19} />
          Coming Soon Menu
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/72 px-4 pb-4 backdrop-blur-md sm:items-center sm:pb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/12 bg-[#111111]/95 p-5 shadow-glass"
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-pixel text-xs uppercase text-lemon">Coming Soon</p>
                  <h3 className="mt-2 font-pixel text-3xl text-white">Future Modules</h3>
                </div>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70 transition hover:text-white"
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close coming soon menu"
                >
                  <X aria-hidden="true" size={18} />
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {futureFeatures.map((feature) => {
                  const Icon = iconMap[feature.icon] ?? Sparkles;

                  return (
                    <button
                      className="group min-h-44 rounded-[24px] border border-white/10 bg-white/[0.045] p-5 text-left transition duration-200 hover:border-lemon/35 hover:bg-white/[0.07]"
                      key={feature.title}
                      type="button"
                      onClick={() => openFeature(feature)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-lemon transition group-hover:border-lemon/35">
                          <Icon aria-hidden="true" size={20} />
                        </span>
                        <StatusPill tone="white">Soon</StatusPill>
                      </div>
                      <h4 className="mt-5 font-pixel text-lg text-white">{feature.title}</h4>
                      <p className="mt-3 text-sm leading-6 text-white/58">{feature.description}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
