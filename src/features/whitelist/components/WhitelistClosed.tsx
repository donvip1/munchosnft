"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { GlassCard } from "@/components/ui/GlassCard";

export function WhitelistClosed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <GlassCard className="mx-auto max-w-3xl overflow-hidden">
        <div className="flex flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-16">
          <motion.div
            className="relative h-56 w-56 sm:h-64 sm:w-64"
            initial={{ y: 110, scale: 0.55, opacity: 0 }}
            animate={{ y: [110, -14, 0], scale: [0.55, 1.06, 1], opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/images/munchos1.png"
              alt="Munchos NFT"
              fill
              sizes="(max-width: 640px) 224px, 256px"
              className="object-contain drop-shadow-[0_0_30px_rgba(200,255,0,0.42)]"
              priority
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.35 }}
          >
            <p className="font-pixel text-4xl uppercase leading-none text-lemon sm:text-5xl">
              Whitelist Closed
            </p>
            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/62 sm:text-base">
              Thanks for stopping by. Whitelist registration is no longer
              accepting new entries.
            </p>
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
