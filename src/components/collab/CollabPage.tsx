"use client";

import { motion } from "framer-motion";
import { Handshake, Layers3, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CollabForm } from "@/components/collab/CollabForm";
import { CollabParticles } from "@/components/collab/CollabParticles";
import { GlassCard } from "@/components/ui/GlassCard";

const ecosystemHighlights = [
  {
    title: "Community Reach",
    text: "Coordinated campaigns, AMAs, giveaways, and growth loops for Web3 communities.",
    icon: Sparkles
  },
  {
    title: "NFT Expansion",
    text: "Partnership surfaces for mints, collections, whitelist exchanges, and launch moments.",
    icon: Layers3
  },
  {
    title: "Chain Alignment",
    text: "Builder-focused collaboration paths across the Robinhood Chain ecosystem.",
    icon: ShieldCheck
  }
];

export function CollabPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink px-4 py-10 sm:px-6 lg:px-8">
      <CollabParticles />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(200,255,0,0.15),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_48%)]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.header
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link className="mx-auto block w-full max-w-[190px] sm:max-w-[280px]" href="/">
            <Image
              src="/images/munchosnft.png"
              alt="Munchos NFT"
              width={680}
              height={454}
              className="h-auto w-full object-contain drop-shadow-[0_0_30px_rgba(200,255,0,0.42)]"
              priority
            />
          </Link>
          <p className="mt-6 font-pixel text-xs uppercase tracking-normal text-lemon">
            Partnership Portal
          </p>
          <h1 className="mt-3 font-pixel text-3xl leading-tight text-white sm:text-6xl">
            COLLABORATE WITH MUNCHOS
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/64 sm:text-lg">
            Building the future of Web3 together. Let&apos;s create something legendary.
          </p>
        </motion.header>

        <motion.section
          className="mx-auto mt-8 max-w-3xl"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lemon/35 bg-lemon/10 text-lemon shadow-lemon">
                <Handshake aria-hidden="true" size={24} />
              </div>
              <div>
                <h2 className="font-pixel text-2xl text-white">Partnership Opportunities</h2>
                <p className="mt-2 text-sm leading-7 text-white/62">
                  We collaborate with creators, NFT communities, Web3 projects, ecosystem partners,
                  marketplaces, media platforms and builders across the Robinhood Chain ecosystem.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <motion.section
          className="mx-auto mt-6 grid max-w-5xl gap-3 md:grid-cols-3"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
        >
          {ecosystemHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard className="p-5" key={item.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/28 text-violet-soft">
                  <Icon aria-hidden="true" size={19} />
                </div>
                <h3 className="mt-4 font-pixel text-lg text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{item.text}</p>
              </GlassCard>
            );
          })}
        </motion.section>

        <motion.section
          className="mt-8"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <div className="mx-auto mb-5 max-w-[760px] rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:flex sm:items-center sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lemon text-black">
              <Rocket aria-hidden="true" size={18} />
            </div>
            <div className="mt-3 sm:mt-0">
              <h2 className="font-pixel text-lg text-white">Why collaborate with Munchos?</h2>
              <p className="mt-1 text-sm leading-6 text-white/62">
                Tell us who you are, what you are building, and how a Munchos collaboration can
                create value for both communities.
              </p>
            </div>
          </div>
          <CollabForm />
        </motion.section>
      </div>
    </main>
  );
}
