"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown, Sparkles } from "lucide-react";

import { LinkButton } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { siteConfig } from "@/config/site";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex min-h-[82svh] items-center overflow-hidden px-4 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8"
    >
      <div className="absolute inset-0 bg-pixel-grid bg-[length:28px_28px] opacity-[0.16]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lemon/40 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 text-center">
        <div className="mx-auto flex flex-wrap justify-center gap-2">
          <StatusPill tone="green">
            <Sparkles aria-hidden="true" size={13} />
            Flagship Community App
          </StatusPill>
          <StatusPill tone="purple">{siteConfig.chain} Native</StatusPill>
        </div>

        <motion.div
          className="relative mx-auto w-full max-w-[300px] sm:max-w-[390px]"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/images/munchosnft.png"
            alt="Munchos NFT"
            width={680}
            height={454}
            className="h-auto w-full drop-shadow-[0_0_28px_rgba(200,255,0,0.52)]"
            priority
          />
        </motion.div>

        <div className="mx-auto max-w-4xl">
          <h1 className="font-pixel text-4xl leading-[1.08] text-white sm:text-6xl lg:text-7xl">
            The Future of NFT Evolution Starts Here
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-pixel text-xl leading-relaxed text-lemon sm:text-2xl">
            Collect. Fuse. Evolve.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-white/64 sm:text-lg">
            Built for Robinhood Chain as a scalable Web3 application layer, not a static NFT page.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/waitlist" size="lg">
              Join Waitlist
            </LinkButton>
            <LinkButton href="#features" size="lg" variant="secondary">
              Learn More
              <ChevronDown aria-hidden="true" size={18} />
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
