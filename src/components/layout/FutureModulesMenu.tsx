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

import { Button } from "@/components/ui/Button";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
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

export function FutureModulesMenu() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function openFeature(feature: Feature) {
    setMenuOpen(false);
    setSelectedFeature(feature);
  }

  return (
    <>
      <Button
        aria-label="Open future modules menu"
        className="h-9 w-9 px-0 sm:h-10 sm:w-10"
        size="sm"
        title="Open future modules"
        type="button"
        variant="secondary"
        onClick={() => setMenuOpen(true)}
      >
        <Menu aria-hidden="true" size={18} />
      </Button>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/72 px-4 pb-4 pt-24 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/12 bg-[#111111]/95 p-4 shadow-glass sm:p-5"
              initial={{ opacity: 0, y: 72 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 48 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/18" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-pixel text-xs uppercase text-lemon">Coming Soon</p>
                  <h3 className="mt-2 font-pixel text-2xl text-white">Future Modules</h3>
                </div>
                <button
                  aria-label="Close future modules menu"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70 transition hover:text-white"
                  type="button"
                  onClick={() => setMenuOpen(false)}
                >
                  <X aria-hidden="true" size={18} />
                </button>
              </div>

              <div className="mt-5 max-h-[58dvh] space-y-3 overflow-y-auto pr-1 sm:max-h-[62dvh]">
                {futureFeatures.map((feature) => {
                  const Icon = iconMap[feature.icon] ?? Sparkles;

                  return (
                    <button
                      className="group flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition duration-200 hover:border-lemon/35 hover:bg-white/[0.07]"
                      key={feature.title}
                      type="button"
                      onClick={() => openFeature(feature)}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-lemon transition group-hover:border-lemon/35">
                        <Icon aria-hidden="true" size={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-pixel text-base text-white">{feature.title}</h4>
                          <StatusPill tone="white">Soon</StatusPill>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/58">
                          {feature.description}
                        </p>
                      </div>
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
    </>
  );
}
