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
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
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
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  function openFeature(feature: Feature) {
    setMenuOpen(false);
    setSelectedFeature(feature);
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        aria-controls={menuId}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={menuOpen ? "Close future modules menu" : "Open future modules menu"}
        className="h-9 w-9 px-0 sm:h-10 sm:w-10"
        size="sm"
        title={menuOpen ? "Close future modules" : "Open future modules"}
        type="button"
        variant="secondary"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
      </Button>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            aria-label="Future modules"
            className="fixed inset-x-0 top-16 z-30 border-b border-white/12 bg-ink shadow-glass sm:top-20"
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            <ul className="mx-auto max-h-[min(calc(100dvh-4rem),28rem)] w-full max-w-7xl overflow-y-auto px-4 py-2 sm:max-h-[min(calc(100dvh-5rem),30rem)] sm:px-6 lg:px-8">
              {futureFeatures.map((feature) => {
                const Icon = iconMap[feature.icon] ?? Sparkles;

                return (
                  <li className="border-b border-white/[0.08] last:border-b-0" key={feature.title}>
                    <button
                      className="group flex min-h-11 w-full items-center gap-3 py-2.5 text-left transition duration-200 hover:bg-white/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lemon sm:min-h-12"
                      role="menuitem"
                      type="button"
                      onClick={() => openFeature(feature)}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center text-lemon transition group-hover:text-lemon-soft">
                        <Icon aria-hidden="true" size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-pixel text-sm leading-5 text-white sm:text-base">
                          {feature.title}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
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
    </div>
  );
}
